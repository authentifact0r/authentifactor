import { NextRequest, NextResponse } from "next/server";
import { listToolSchemas, runTool } from "@/lib/local-ai/tools";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ tools: listToolSchemas() });
}

export async function POST(req: NextRequest) {
  const { tool, args } = await req.json();
  if (!tool) {
    return NextResponse.json({ error: "tool is required" }, { status: 400 });
  }
  try {
    const result = await runTool(tool, args ?? {});
    return NextResponse.json({ tool, result });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
