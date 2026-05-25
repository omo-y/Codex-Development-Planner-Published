# Codex開発プランナー

Codex開発プランナーは、作りたいアプリのアイデアを整理し、Codexアプリに貼り付けやすい開発プロンプトを生成するWebアプリです。

このアプリはコードを直接生成するものではありません。アプリの目的、対象ユーザー、機能、画面構成、開発環境、保存方式を整理し、Codexへ渡す指示書を作るための基本機能版です。

## 入力方式

初期リリースでは、初心者向けの入力方式だけに絞っています。技術名や画面構成が分からない人でも使いやすいように、以下の流れで入力します。

1. 作りたいものに近いカードを選ぶ
2. アプリ名、概要、使う人を入力する
3. 必要そうな機能をチェックする
4. 必要そうな画面をチェックする
5. 必要な場合だけ詳細設定で技術構成を変更する

アプリの種類、開発環境、使用するAI、保存方式は最初からすべて選ばせるのではなく、おすすめ値を自動で入れる設計にしています。

## 対象ユーザー

- Codexを使ってアプリ開発を始めたい初心者
- 個人開発者
- プログラミング経験は少ないが、自分用アプリを作りたい人
- 副業や学習目的で小さなアプリを作りたい人
- アプリ案はあるが、Codexにどう指示すればよいか分からない人

## できること

- アプリ案入力
- 目的別プリセット選択
- 対象ユーザー整理
- 機能チェックリスト
- 画面チェックリスト
- 開発環境、使用AI、保存方式の詳細設定
- Codex用プロンプト生成
- 生成履歴保存
- 最新5件の履歴表示
- 履歴から入力内容を復元
- 履歴削除
- 生成プロンプトのコピー

## 使用技術

- Next.js App Router
- TypeScript
- React
- Tailwind CSS
- SQLite
- Prisma

## 必要なもの

- Node.js
- npm

## .env.local の作成

`.env.local.example` を参考に、プロジェクトルートに `.env.local` を作成してください。

```env
DATABASE_URL="file:./dev.db"
```

Prisma CLIを使うときは `.env.local` ではなく `.env` が読まれます。`npx prisma migrate dev` で `DATABASE_URL` が見つからない場合は、同じ内容で `.env` も作成してください。

## インストール手順

```bash
npm install
```

## Prismaの準備

Prisma Clientを生成します。

```bash
npx prisma generate
```

SQLiteのDBとテーブルを作成します。

```bash
npx prisma migrate dev --name init
```

環境によって `migrate dev` が非対話環境として止まる場合は、既存のマイグレーションを適用します。

```bash
npx prisma migrate deploy
```

SQLiteファイルが存在せず schema engine エラーになる場合は、空の `prisma/dev.db` を作成してから、以下を実行してください。

```bash
npx prisma db push
```

保存されたデータを確認したい場合は、Prisma Studioを使えます。

```bash
npx prisma studio
```

## 起動手順

```bash
npm run dev
```

ブラウザで以下を開きます。

```text
http://localhost:3000
```

## 使い方

1. 「記録・管理アプリ」「予約・受付アプリ」など、作りたいものに近いカードを選びます。
2. アプリ名を入力します。
3. 作りたいアプリの概要を入力します。
4. 誰が使うかを入力します。
5. 必要機能と画面構成をチェックします。
6. 必要に応じて、追加したい機能や画面を入力します。
7. 技術構成を変えたい場合だけ、詳細設定を開いて変更します。
8. 「Codex用プロンプトを生成」を押します。
9. 生成されたプロンプトをコピーし、Codexアプリに貼り付けます。

## よくあるエラーと対処法

### DBに保存されない

`.env.local` が作成されているか確認してください。

```env
DATABASE_URL="file:./dev.db"
```

その後、以下を実行してください。

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### Prismaエラー

Prisma Clientが未生成の可能性があります。

```bash
npx prisma generate
```

DBの状態を作り直したい場合は、開発環境であることを確認してから以下を実行します。

```bash
npx prisma migrate dev
```

### コピーできない

ブラウザのクリップボード権限が無効になっている可能性があります。別のブラウザで試すか、生成結果のテキストエリアから手動でコピーしてください。

### プロンプトが生成できない

アプリ名、アプリの概要、対象ユーザーが入力されているか確認してください。アプリの概要は10文字以上で入力してください。

## 将来的な拡張案

- AIによる要件整理
- Ollama + Qwen3 連携
- OpenAI API連携
- Supabase保存
- テンプレート機能
- スマホアプリ用プロンプト強化
- 生成プロンプトの品質チェック

## Ollama + Qwen3 連携方針

基本機能版ではローカルLLMを使いません。現在はテンプレートベースで安定してCodex用プロンプトを生成します。

将来的には Ollama + Qwen3 を使って、以下のような機能を追加できます。

- アプリ案の自動整理
- 不足している機能の提案
- 画面構成の自動提案
- DB設計案の自動生成
- API設計案の自動生成
- Codex用プロンプトの品質改善
- 開発ロードマップ生成
- 追加改善プロンプト生成

そのために、AI補助処理用の `lib/aiPlanner.ts` を用意しています。将来Ollama連携を追加する場合は、テンプレート生成を fallback として残したまま、このファイルにAI処理を集約してください。

将来的にOllama連携を追加する場合は、`.env.local` に以下のような環境変数を追加する想定です。基本機能版では必須ではありません。

```env
OLLAMA_MODEL=qwen3:latest
OLLAMA_ENDPOINT=http://localhost:11434/api/generate
```

## ファイル構成

```text
app/
  layout.tsx
  globals.css
  page.tsx
  api/
    projects/
      route.ts
    prompt/
      route.ts
lib/
  prisma.ts
  projectRepository.ts
  promptBuilder.ts
  templates.ts
  markdown.ts
  aiPlanner.ts
types/
  project.ts
prisma/
  schema.prisma
.env.local.example
README.md
```
