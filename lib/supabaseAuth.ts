export type AuthenticatedUser = {
  id: string;
  email?: string;
};

function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase認証の環境変数が設定されていません。NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY を設定してください。"
    );
  }

  return {
    supabaseUrl,
    supabaseAnonKey
  };
}

function getSupabaseAdminConfig() {
  const { supabaseUrl } = getSupabaseConfig();
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseServiceRoleKey) {
    throw new Error(
      "アカウント削除用の環境変数 SUPABASE_SERVICE_ROLE_KEY が設定されていません。"
    );
  }

  return {
    supabaseUrl,
    supabaseServiceRoleKey
  };
}

export async function getAuthenticatedUser(
  request: Request
): Promise<AuthenticatedUser> {
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : "";

  if (!token) {
    throw new Error("ログインが必要です。");
  }

  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${token}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("ログイン情報の確認に失敗しました。もう一度ログインしてください。");
  }

  const user = (await response.json()) as {
    id?: string;
    email?: string;
  };

  if (!user.id) {
    throw new Error("ログイン情報が正しくありません。");
  }

  return {
    id: user.id,
    email: user.email
  };
}

export async function deleteSupabaseAuthUser(userId: string): Promise<void> {
  const { supabaseUrl, supabaseServiceRoleKey } = getSupabaseAdminConfig();
  const response = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
    method: "DELETE",
    headers: {
      apikey: supabaseServiceRoleKey,
      Authorization: `Bearer ${supabaseServiceRoleKey}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(
      "Supabase Auth のユーザー削除に失敗しました。Service Role Key の設定を確認してください。"
    );
  }
}
