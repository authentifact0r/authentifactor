import { NextRequest, NextResponse } from "next/server";
import { graphSearch } from "@/lib/local-ai/rag";
import { readVaultIndex } from "@/lib/local-ai/obsidian-loader";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const nodeId = url.searchParams.get("node");
  const depth = Number(url.searchParams.get("depth") ?? "1");

  if (!nodeId) {
    // No node specified → return whole graph summary.
    const { graph } = await readVaultIndex();
    return NextResponse.json({
      nodeCount: graph.nodes.length,
      edgeCount: graph.edges.length,
      sample: graph.nodes.slice(0, 20),
    });
  }
  return NextResponse.json(await graphSearch(nodeId, depth));
}
