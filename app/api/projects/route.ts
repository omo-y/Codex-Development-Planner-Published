import { NextResponse } from "next/server";
import {
  createProjectPlan,
  deleteProjectPlan,
  getRecentProjectPlans
} from "@/lib/projectRepository";
import { buildCodexPrompt } from "@/lib/promptBuilder";
import { getAuthenticatedUser } from "@/lib/supabaseAuth";
import type { ProjectPlanInput } from "@/types/project";

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    const projects = await getRecentProjectPlans(user.id);
    return NextResponse.json({ projects });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "履歴の取得に失敗しました。";

    return NextResponse.json(
      { error: message },
      { status: message === "ログインが必要です。" ? 401 : 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    const body = (await request.json()) as ProjectPlanInput & {
      generatedPrompt?: string;
    };
    const generatedPrompt = body.generatedPrompt ?? buildCodexPrompt(body);
    const project = await createProjectPlan(body, generatedPrompt, user.id);

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "履歴の保存に失敗しました。";

    return NextResponse.json(
      { error: message },
      { status: message === "ログインが必要です。" ? 401 : 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "削除する履歴が指定されていません。" },
        { status: 400 }
      );
    }

    const deleted = await deleteProjectPlan(id, user.id);

    if (!deleted) {
      return NextResponse.json(
        { error: "削除できる履歴が見つかりませんでした。" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "履歴の削除に失敗しました。";

    return NextResponse.json(
      { error: message },
      { status: message === "ログインが必要です。" ? 401 : 500 }
    );
  }
}
