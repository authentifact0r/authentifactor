/**
 * Local AI subsystem — public barrel.
 *
 * Everything downstream code should need to talk to the sovereign stack.
 */

export { loadVault, persistVaultIndex, readVaultIndex } from "./obsidian-loader";
export type { ObsidianNote, KnowledgeGraph, Chunk } from "./obsidian-loader";

export { embedText, indexChunks, loadAllEmbeddings, cosineSim } from "./embeddings";

export {
  semanticSearch,
  graphSearch,
  hybridSearch,
  rerankedSearch,
  buildContext,
  invalidateCaches,
} from "./rag";
export type { RagHit, ContextBlock } from "./rag";

export { runKnowledgeAgent } from "./knowledge-agent";
export type { KnowledgeAnswer } from "./knowledge-agent";

export { runAgentLoop } from "./agent-loop";
export type { AgentRun, AgentStep } from "./agent-loop";

export { TOOLS, listToolSchemas, runTool } from "./tools";
export type { Tool, ToolSchema } from "./tools";

export {
  createSession,
  getOrCreateSession,
  listSessions,
  deleteSession,
  renameSession,
  appendMessage,
  getHistory,
  formatHistoryForPrompt,
} from "./memory";
export type { Session, Message, MessageRole } from "./memory";

export { startVaultWatcher } from "./watcher";
export type { VaultWatcher, WatcherEvent, WatcherOptions } from "./watcher";

export * as localAiConfig from "./config";
