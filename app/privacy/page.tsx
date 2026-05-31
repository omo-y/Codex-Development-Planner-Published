import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "プライバシーポリシー｜Codex開発プランナー",
  description:
    "Codex開発プランナーで取得する情報、利用目的、第三者提供について説明します。",
  robots: {
    index: true,
    follow: true
  }
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <Link
          href="/"
          className="text-sm font-semibold text-blue-700 underline-offset-4 hover:underline"
        >
          Codex開発プランナーに戻る
        </Link>
        <h1 className="mt-6 text-3xl font-bold tracking-normal text-ink">
          プライバシーポリシー
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-700">
          Codex開発プランナーは、Codexを使ったアプリ開発の準備を支援するWebアプリです。このページでは、当アプリで扱う情報と利用目的を説明します。
        </p>

        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-bold text-ink">取得する情報</h2>
          <p className="text-sm leading-7 text-slate-700">
            当アプリでは、Supabase Authによるログインのためにメールアドレスなどの認証情報を扱います。また、ユーザーが入力したアプリ案、対象ユーザー、必要機能、画面構成、生成されたCodex用プロンプト履歴を保存します。
          </p>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-bold text-ink">利用目的</h2>
          <p className="text-sm leading-7 text-slate-700">
            取得した情報は、ログイン状態の管理、ユーザーごとの生成履歴保存、履歴の復元、アカウント削除のために利用します。
          </p>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-bold text-ink">第三者提供について</h2>
          <p className="text-sm leading-7 text-slate-700">
            法令に基づく場合を除き、保存された情報を第三者へ販売または提供することはありません。認証とデータ保存にはSupabaseを利用します。
          </p>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-bold text-ink">問い合わせ先</h2>
          <p className="text-sm leading-7 text-slate-700">
            問い合わせ先は、公開時に運営者の連絡先またはGitHubリポジトリのIssue欄などを設定してください。
          </p>
        </section>
      </div>
    </main>
  );
}
