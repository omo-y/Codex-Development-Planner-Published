import type { ProjectPlanInput } from "@/types/project";
import { DEVELOPMENT_STACK_NOTES } from "./templates";
import { toMarkdownList, toOptionalText } from "./markdown";

export function validateProjectPlanInput(input: ProjectPlanInput): string[] {
  const errors: string[] = [];

  if (!input.appName.trim()) {
    errors.push("アプリ名を入力してください。");
  }

  if (input.appIdea.trim().length < 10) {
    errors.push("アプリの概要は10文字以上で入力してください。");
  }

  if (!input.targetUser.trim()) {
    errors.push("対象ユーザーを入力してください。");
  }

  return errors;
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
${input.developmentStack} を使って、「${input.appName.trim()}」を作成してください。

# アプリの目的
${input.appIdea.trim()}

# 対象ユーザー
${input.targetUser.trim()}

# アプリの種類
${input.appType}

# 技術構成
- ${input.developmentStack}
- 使用するAI：${input.aiOption}
- 保存方式：${input.storageOption}

# 必要機能
${toMarkdownList(input.features)}

# 画面構成
${toMarkdownList(input.screens)}

# 保存方式
${input.storageOption} を前提に、基本機能版として必要な保存処理を実装してください。

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
