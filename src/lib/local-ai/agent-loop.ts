/**
 * ReAct-style agent loop.
 *
 * The model is asked to emit one of these JSON shapes per step:
 *   { "action": "tool",   "tool": "<name>", "args": {...}, "thought": "..." }
 *   { "action": "finish", "answer": "...", "thought": "..." }
 *
 * We parse it, run the tool if requested, append the result as an
 * observation, and loop until `finish` or maxSteps.
 */

import { smartLLM } from "../smart-llm";
import { listToolSchemas, runTool, ToolValidationError } from "./tools";
import {
  getOrCreateSession,
  getHistory,
  appendMessage,
  formatHistoryForPrompt,
} from "./memory";

export interface AgentStep {
  thought?: string;
  action: "tool" | "finish";
  tool?: string;
  args?: Record<string, unknown>;
  observation?: unknown;
  answer?: string;
}

export interface AgentRun {
  sessionId: string;
  question: string;
  steps: AgentStep[];
  answer: string;
  model: string;
  provider: string;
}

function buildSystem(): string {
  const schemas = listToolSchemas();
  const toolList = schemas
    .map((s) => {
      const params = Object.entries(s.parameters)
        .map(([k, v]) => `    - ${k} (${v.type})${v.required ? " [required]" : ""}: ${v.description}`)
        .join("\n");
      return `- ${s.name}: ${s.description}\n${params}`;
    })
    .join("\n");

  return `You are a local autonomous agent. You solve tasks by calling tools and reasoning over their results.

You MUST respond with a single JSON object and nothing else. No prose, no markdown fences.

Use one of these two shapes:

  {"thought": "why I'm doing this", "action": "tool", "tool": "<toolName>", "args": { ... }}

  {"thought": "final reasoning", "action": "finish", "answer": "the user-facing answer"}

Available tools:
${toolList}

Rules:
- Always emit valid JSON, parseable on the first try.
- You MUST call at least one tool before finishing. Never finish on step 1 without an observation.
- For any question about notes, projects, vault, or personal knowledge, your first action MUST be hybridKnowledgeSearch.
- Never fabricate tool names, arguments, or answers. If observations are empty, say so.
- Stop as soon as you have enough information — do not loop unnecessarily.`;
}

function parseStep(raw: string): AgentStep {
  const trimmed = raw.trim();
  // Strip accidental code fences
  const cleaned = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```$/g, "")
    .trim();
  // Grab the first {...} block
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error(`Agent output was not JSON: ${raw.slice(0, 200)}`);
  }
  const json = cleaned.slice(start, end + 1);
  const parsed = JSON.parse(json);
  if (parsed.action !== "tool" && parsed.action !== "finish") {
    throw new Error(`Invalid action: ${parsed.action}`);
  }
  return parsed as AgentStep;
}

export async function runAgentLoop(
  question: string,
  opts: {
    maxSteps?: number;
    complexity?: "simple" | "medium" | "high";
    sessionId?: string;
    historyLimit?: number;
  } = {}
): Promise<AgentRun> {
  const maxSteps = opts.maxSteps ?? 6;
  const system = buildSystem();
  const steps: AgentStep[] = [];

  const session = await getOrCreateSession(opts.sessionId);
  const prior = await getHistory(session.id, opts.historyLimit ?? 6);
  const historyText = formatHistoryForPrompt(prior);

  const transcript: string[] = [];
  if (historyText) transcript.push(`Prior conversation:\n${historyText}`);
  transcript.push(`User question: ${question}`);

  let lastRes = { model: "", provider: "" };

  for (let i = 0; i < maxSteps; i++) {
    const prompt = transcript.join("\n\n") + "\n\nRespond with the next JSON step.";
    const res = await smartLLM({
      prompt,
      system,
      complexity: opts.complexity ?? "simple",
      maxTokens: 600,
      jsonMode: true,
    });
    lastRes = { model: res.model, provider: res.provider };

    let step: AgentStep;
    try {
      step = parseStep(res.text);
    } catch (err) {
      // Feed the parse error back and give the model one retry.
      transcript.push(`Model output:\n${res.text}`);
      transcript.push(`Observation: parse error — ${(err as Error).message}. Reply with valid JSON only.`);
      continue;
    }

    if (step.action === "finish") {
      // Reject a finish with no prior observations — force at least one tool call.
      if (steps.length === 0) {
        transcript.push(
          `Model output:\n${res.text}`,
          "Observation: you finished without calling any tool. You MUST call hybridKnowledgeSearch first and base your answer on its observation."
        );
        continue;
      }
      steps.push(step);
      await appendMessage(session.id, "user", question);
      await appendMessage(session.id, "assistant", step.answer ?? "", {
        steps: steps.length,
        model: lastRes.model,
      });
      return {
        sessionId: session.id,
        question,
        steps,
        answer: step.answer ?? "",
        model: lastRes.model,
        provider: lastRes.provider,
      };
    }

    // Tool call — validate args via the tool's Zod schema. On a
    // ValidationError we feed the issues back as a specific correction
    // hint so the model can fix its arguments in the next step rather
    // than guessing.
    let observation: unknown;
    try {
      observation = await runTool(step.tool!, step.args ?? {});
    } catch (err) {
      if (err instanceof ToolValidationError) {
        observation = {
          validation_error: true,
          tool: err.toolName,
          issues: err.issues,
          hint: "Your arguments did not match the tool's schema. Fix the listed issues and retry with corrected args.",
        };
      } else {
        observation = { error: (err as Error).message };
      }
    }
    step.observation = observation;
    steps.push(step);

    transcript.push(
      `Thought: ${step.thought ?? ""}\nAction: ${step.tool}(${JSON.stringify(step.args ?? {})})\nObservation: ${JSON.stringify(observation).slice(0, 1200)}`
    );
  }

  // Ran out of steps — ask the model for a final answer from what we have.
  const finalPrompt =
    transcript.join("\n\n") +
    "\n\nYou have hit the step limit. Respond with a finish JSON containing the best answer you can give from the observations so far.";
  const finalRes = await smartLLM({
    prompt: finalPrompt,
    system,
    complexity: "simple",
    maxTokens: 600,
    jsonMode: true,
  });
  const finishWith = async (answer: string, step?: AgentStep): Promise<AgentRun> => {
    if (step) steps.push(step);
    await appendMessage(session.id, "user", question);
    await appendMessage(session.id, "assistant", answer, {
      steps: steps.length,
      model: finalRes.model,
      truncated: true,
    });
    return {
      sessionId: session.id,
      question,
      steps,
      answer,
      model: finalRes.model,
      provider: finalRes.provider,
    };
  };

  try {
    const step = parseStep(finalRes.text);
    return finishWith(step.answer ?? "", step);
  } catch {
    return finishWith(finalRes.text);
  }
}
