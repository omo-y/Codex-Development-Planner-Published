# AGENTS.md

このリポジトリで作業するAIエージェント向けの開発メモです。

## 基本方針

- 最終的な回答は日本語で行う。
- 初心者向けアプリであることを優先し、画面上の文言は分かりやすくする。
- 実装は動作だけでなく、保守性、型安全性、エラー処理を重視する。
- 既存の構成と命名に合わせ、不要な大規模リファクタリングは避ける。
- DB操作は `app/page.tsx` に直接書かず、APIルートと `lib/projectRepository.ts` に分離する。
- プロンプト生成処理は `lib/promptBuilder.ts` に集約する。
- 将来のAI補助処理は `lib/aiPlanner.ts` に集約する。

## 技術構成

- Next.js App Router
- TypeScript
- React
- Tailwind CSS
- SQLite
- Prisma

## 重要なファイル

- `app/page.tsx`: メイン画面。初期リリースでは初心者向けフローのみを持つ。
- `app/api/prompt/route.ts`: Codex用プロンプト生成API。
- `app/api/projects/route.ts`: 生成履歴の取得、保存、削除API。
- `lib/promptBuilder.ts`: テンプレートベースのプロンプト生成。
- `lib/projectRepository.ts`: Prismaを使ったDB操作。
- `lib/templates.ts`: 選択肢、プリセット、補足テンプレート。
- `lib/aiPlanner.ts`: 将来のOllama + Qwen3連携用のモック実装。
- `types/project.ts`: プロジェクト案とAI補助処理の型定義。
- `prisma/schema.prisma`: SQLite + PrismaのDB定義。

## UI方針

- 初期リリースでは入力モード切替を入れない。
- カード選択とチェックボックスを中心にする。
- アプリの種類、開発環境、AI、保存方式は折りたたみの詳細設定で変更できるようにする。
- 将来、詳細入力モードを追加する場合も、既存の初心者向けフローを壊さない。
- 生成結果はコピーしやすい textarea で表示する。
- エラー文は日本語で分かりやすく表示する。

## エラー処理

- アプリ名が空の場合はエラーにする。
- アプリ概要が短すぎる場合はエラーにする。
- 対象ユーザーが空の場合はエラーにする。
- DB保存に失敗しても、生成済みプロンプトの表示は消さない。
- 履歴取得、履歴削除、クリップボードコピーの失敗も日本語で表示する。

## Prisma

Prisma CLIを使う場合は `.env` に以下が必要です。

```env
DATABASE_URL="file:./dev.db"
```

Next.js実行時は `.env.local` も使います。

```env
DATABASE_URL="file:./dev.db"
```

## 検証コマンド

変更後は可能な限り以下を実行してください。

```bash
npm run lint
npx tsc --noEmit
npm run build
```

DB関連を変更した場合は以下も確認してください。

```bash
npx prisma generate
npx prisma db push
```

## Git運用

- コミットはユーザーが行う。
- 作業が一区切りしたら、英語のConventional Commit形式でコミットメッセージ案を提示する。
- 例: `refactor: ship beginner-only initial planner flow`
