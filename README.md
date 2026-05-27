# Codex開発プランナー

Codex開発プランナーは、作りたいアプリのアイデアを整理し、Codexアプリに貼り付けやすい開発プロンプトを生成するWebアプリです。

このアプリはコードを直接生成するものではありません。アプリの目的、対象ユーザー、機能、画面構成、開発環境、保存方式を整理し、Codexへ渡す指示書を作るための基本機能版です。

## 初期リリースの注意

この初期リリースには認証機能がありません。

Vercelなどで公開した場合、生成履歴はアクセスした全ユーザーで共有されます。個人情報、未公開アイデア、機密情報は入力しないでください。

次のバージョンで、ユーザー認証とユーザー別の履歴保存を追加する予定です。

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
- Supabase Postgres
- Prisma

## 必要なもの

- Node.js
- npm
- Supabaseプロジェクト
- Vercelアカウント

## .env.local の作成

`.env.local.example` を参考に、プロジェクトルートに `.env.local` を作成してください。

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/postgres?pgbouncer=true&connection_limit=1"
```

Prisma CLIを使うときは `.env.local` ではなく `.env` が読まれます。ローカルで `npx prisma migrate dev` を使う場合は、同じ内容で `.env` も作成してください。

## Supabaseの準備

1. Supabaseで新しいプロジェクトを作成します。
2. Project Settings からPostgresの接続文字列を確認します。
3. Prismaで使う `DATABASE_URL` として、Supabase Postgresの接続文字列を `.env.local` と `.env` に設定します。
4. パスワードやホスト名は自分のSupabaseプロジェクトの値に置き換えてください。

## インストール手順

```bash
npm install
```

## Prismaの準備

Prisma Clientを生成します。

```bash
npx prisma generate
```

Supabase Postgresにテーブルを作成します。

```bash
npx prisma migrate dev --name init
```

本番環境やVercelでは、既存のマイグレーションを適用します。

```bash
npx prisma migrate deploy
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

## Vercelで公開する手順

1. GitHubにこのリポジトリをpushします。
2. Vercelで新しいプロジェクトとしてインポートします。
3. VercelのEnvironment Variablesに `DATABASE_URL` を追加します。
4. 値にはSupabase Postgresの接続文字列を設定します。
5. 初回デプロイ前、またはデプロイ後に以下でSupabaseへマイグレーションを適用します。

```bash
npx prisma migrate deploy
```

6. Vercelで再デプロイします。

`postinstall` で `prisma generate` を実行するため、Vercelのビルド時にもPrisma Clientが生成されます。

## 履歴共有について

初期リリースでは認証機能がありません。

そのため、Vercelなどで公開した場合は以下の挙動になります。

- 生成履歴は全ユーザーで共有される
- 誰かが作成した履歴を他のユーザーも見られる
- 誰かが履歴を削除すると他のユーザーにも反映される

個人情報、未公開アイデア、機密情報は入力しないでください。

次のバージョンで、Supabase Authなどを使ったユーザー認証と、ユーザー別の履歴保存を追加する予定です。

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

## 生成した開発プロンプトの使い方

生成結果は、Codexにアプリ開発を依頼するための下書きです。次の流れで使います。

1. 生成結果を読み、アプリ名、目的、機能、画面構成が意図どおりか確認します。
2. 足りない条件があれば、左側の入力欄や追加したい注意点を修正して再生成します。
3. 「コピー」を押して、生成されたプロンプト全体をコピーします。
4. Codexアプリで新しい作業を開き、コピーしたプロンプトをそのまま貼り付けます。
5. Codexが作成したファイル構成、コード、起動手順を確認します。
6. 実装後に修正したい点が出たら、このアプリの履歴から元の案を復元し、条件を追加して改善用のプロンプトを作ります。

### 貼り付ける前に確認すること

- 作りたいアプリの目的が具体的になっているか
- 最低限必要な機能が入っているか
- 画面構成が多すぎないか
- 保存方式が意図に合っているか
- README作成、起動手順、エラー対応などの注意点が入っているか

最初から完璧なプロンプトにする必要はありません。まず基本機能版を作り、Codexの出力を見ながら追加改善していく使い方を想定しています。

## よくあるエラーと対処法

### DBに保存されない

`.env.local` とVercelのEnvironment Variablesに `DATABASE_URL` が設定されているか確認してください。

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/postgres?pgbouncer=true&connection_limit=1"
```

その後、以下を実行してください。

```bash
npx prisma generate
npx prisma migrate deploy
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
- ユーザー認証
- ユーザー別の履歴保存
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
