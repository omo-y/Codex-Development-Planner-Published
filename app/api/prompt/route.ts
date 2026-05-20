import { NextResponse } from "next/server";
import { buildCodexPrompt } from "@/lib/promptBuilder";
import type { ProjectPlanInput } from "@/types/project";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ProjectPlanInput;
    const generatedPrompt = buildCodexPrompt(body);

    return NextResponse.json({ generatedPrompt });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "プロンプトの生成に失敗しました。";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
