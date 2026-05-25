import type { ProjectPlanInput } from "@/types/project";
import { DEVELOPMENT_STACK_NOTES } from "./templates";
import { toMarkdownList, toOptionalText } from "./markdown";

export function validateProjectPlanInput(input: ProjectPlanInput): string[] {
  const errors: string[] = [];

  if (!input.appName.trim()) {
    errors.push("アプリ名を入力してください。");
  }

  if (input.appIdea.trim().length < 10) {
    errors.push(
      "このアプリで実現したいこと・主な機能は10文字以上で入力してください。"
    );
  }

  if (!input.targetUser.trim()) {
    errors.push("使う人・利用シーンを入力してください。");
  }

  return errors;
}

function getDevelopmentInstruction(input: ProjectPlanInput): string {
  if (input.developmentStack === "その他") {
    return `要件に合う開発環境を提案し、「${input.appName.trim()}」を作成してください。`;
  }

  return `${input.developmentStack} を使って、「${input.appName.trim()}」を作成してください。`;
}

function getAppTypeLabel(input: ProjectPlanInput): string {
  if (input.appType === "その他") {
    return "その他（要件に合う形式を提案してください）";
  }

  return input.appType;
}

function getDevelopmentStackLabel(input: ProjectPlanInput): string {
  if (input.developmentStack === "その他") {
    return "未指定（要件に合う開発環境を提案してください）";
  }

  return input.developmentStack;
}

function getAiInstruction(input: ProjectPlanInput): string {
  switch (input.aiOption) {
    case "AIなし":
      return "AI APIやローカルLLMは使わない";
    case "未定":
      return "AI利用は必須にせず、必要な場合のみ候補として提案する";
    default:
      return input.aiOption;
  }
}

function getStorageLabel(input: ProjectPlanInput): string {
  if (input.storageOption === "未定") {
    return "未定（要件に合う保存方式を提案してください）";
  }

  return input.storageOption;
}

function getStorageInstruction(input: ProjectPlanInput): string {
  switch (input.storageOption) {
    case "DBなし":
      return "DB保存は実装せず、画面上の一時的な状態管理だけで動く基本機能版にしてください。必要であれば、将来の保存方式をREADMEに補足してください。";
    case "localStorage":
      return "localStorage を使って、ブラウザ内に必要なデータを保存してください。保存失敗や読み込み失敗も考慮してください。";
    case "SQLite + Prisma":
      return "SQLite + Prisma を使って、基本機能版として必要なデータ保存処理を実装してください。";
    case "Supabase":
      return "Supabase を使った保存構成にしてください。必要な環境変数、テーブル設計、セットアップ手順も説明してください。";
    case "PostgreSQL":
      return "PostgreSQL を使った保存構成にしてください。必要な環境変数、テーブル設計、マイグレーション手順も説明してください。";
    case "Firebase":
      return "Firebase を使った保存構成にしてください。必要な環境変数、コレクション設計、セットアップ手順も説明してください。";
    case "未定":
      return "保存方式は未定です。要件に合う保存方式を提案し、基本機能版として最小限で動く構成にしてください。保存が不要な場合は、DBなしの構成を提案してください。";
  }
}

export function buildCodexPrompt(input: ProjectPlanInput): string {
  const validationErrors = validateProjectPlanInput(input);

  if (validationErrors.length > 0) {
    throw new Error(validationErrors.join("\n"));
  }

  const stackNotes = DEVELOPMENT_STACK_NOTES[input.developmentStack]
    .map((note) => `- ${note}`)
    .join("\n");

  return `あなたは優秀なフルスタックエンジニアです。
${getDevelopmentInstruction(input)}

# このアプリで実現したいこと・主な機能
${input.appIdea.trim()}

# 使う人・利用シーン
${input.targetUser.trim()}

# 作りたいものに近いもの
${getAppTypeLabel(input)}

# 技術構成
- 開発環境：${getDevelopmentStackLabel(input)}
- 使用するAI：${getAiInstruction(input)}
- 保存方式：${getStorageLabel(input)}

# 選択・追加された機能
${toMarkdownList(input.features)}

# 画面構成
${toMarkdownList(input.screens)}

# 保存方式
${getStorageInstruction(input)}

# エラー処理
- 入力不足や保存失敗など、ユーザーが起こしやすいエラーを想定してください。
- エラー時は日本語で分かりやすく表示してください。
- 外部APIやDBを使う場合は、失敗時にも画面が壊れないようにしてください。

# 実装要件
- まずは基本機能版として動くことを優先してください。
- 初心者にも分かりやすいコードにしてください。
- TypeScriptを使う場合は型定義を整理してください。
- エラー時は日本語で分かりやすく表示してください。
- READMEにインストール手順、起動手順、動作確認方法を書いてください。

# 追加の注意点
${toOptionalText(input.extraNotes, "特になし")}

# 開発環境ごとの補足
${stackNotes}

# 最終出力
以下を出力してください。

1. ファイル構成
2. 各ファイルのコード
3. 必要な環境変数
4. インストール手順
5. 起動手順
6. 動作確認方法
7. よくあるエラーと対処法`;
}
