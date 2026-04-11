import { NextRequest, NextResponse } from "next/server";
import { semanticSearch, hybridSearch, buildContext } from "@/lib/local-ai/rag";
import { runKnowledgeAgent } from "@/lib/local-ai/knowledge-agent";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { query, mode = "answer", topN = 6, sessionId } = await req.json();
  if (!query || typeof query !== "string") {
    return NextResponse.json({ error: "query is required" }, { status: 400 });
  }

  switch (mode) {
    case "semantic":
      return NextResponse.json({ hits: await semanticSearch(query, topN) });
    case "hybrid":
      return NextResponse.json({ hits: await hybridSearch(query, topN) });
    case "context":
      return NextResponse.json(await buildContext(query, topN));
    case "answer":
    default:
      return NextResponse.json(await runKnowledgeAgent(query, { sessionId }));
  }
}
