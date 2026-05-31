import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "利用規約｜Codex開発プランナー",
  description:
    "Codex開発プランナーのサービス概要、禁止事項、免責事項について説明します。",
  robots: {
    index: true,
    follow: true
  }
};

export default function TermsPage() {
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
          利用規約
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-700">
          この利用規約は、Codex開発プランナーの利用条件を定めるものです。
        </p>

        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-bold text-ink">サービス概要</h2>
          <p className="text-sm leading-7 text-slate-700">
            Codex開発プランナーは、アプリ案を整理し、Codexアプリに貼り付けられる開発プロンプトを生成するAI開発補助ツールです。コード生成そのものではなく、要件整理と指示文作成を支援します。
          </p>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-bold text-ink">禁止事項</h2>
          <p className="text-sm leading-7 text-slate-700">
            不正アクセス、他者の権利を侵害する利用、法令に違反する利用、サービス運営を妨げる行為を禁止します。
          </p>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-bold text-ink">免責事項</h2>
          <p className="text-sm leading-7 text-slate-700">
            生成されたプロンプトの正確性、完全性、特定目的への適合性は保証しません。生成内容を利用して開発したアプリの動作確認、権利確認、公開判断は利用者の責任で行ってください。
          </p>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-bold text-ink">
            AI生成プロンプトの利用責任
          </h2>
          <p className="text-sm leading-7 text-slate-700">
            CodexやAIコーディングツールへ入力する内容、生成されたコード、公開する成果物については、利用者自身が確認し、必要に応じて修正してください。
          </p>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-bold text-ink">サービス内容変更について</h2>
          <p className="text-sm leading-7 text-slate-700">
            機能改善、保守、セキュリティ対応のため、事前の告知なくサービス内容を変更または停止する場合があります。
          </p>
        </section>
      </div>
    </main>
  );
}
