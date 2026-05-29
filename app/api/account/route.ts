import { NextResponse } from "next/server";
import { deleteProjectPlansByUserId } from "@/lib/projectRepository";
import {
  deleteSupabaseAuthUser,
  getAuthenticatedUser
} from "@/lib/supabaseAuth";

export async function DELETE(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);

    await deleteProjectPlansByUserId(user.id);
    await deleteSupabaseAuthUser(user.id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "アカウント削除に失敗しました。時間をおいてもう一度お試しください。";

    return NextResponse.json(
      { error: message },
      { status: message === "ログインが必要です。" ? 401 : 500 }
    );
  }
}
