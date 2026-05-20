import { NextResponse } from "next/server";
import {
  createProjectPlan,
  deleteProjectPlan,
  getRecentProjectPlans
} from "@/lib/projectRepository";
import { buildCodexPrompt } from "@/lib/promptBuilder";
import type { ProjectPlanInput } from "@/types/project";

export async function GET() {
  try {
    const projects = await getRecentProjectPlans();
    return NextResponse.json({ projects });
  } catch {
    return NextResponse.json(
      { error: "履歴の取得に失敗しました。" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ProjectPlanInput & {
      generatedPrompt?: string;
    };
    const generatedPrompt = body.generatedPrompt ?? buildCodexPrompt(body);
    const project = await createProjectPlan(body, generatedPrompt);

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "履歴の保存に失敗しました。";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "削除する履歴が指定されていません。" },
        { status: 400 }
      );
    }

    await deleteProjectPlan(id);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "履歴の削除に失敗しました。" },
      { status: 500 }
    );
  }
}
