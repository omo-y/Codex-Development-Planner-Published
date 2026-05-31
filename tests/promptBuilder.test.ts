import assert from "node:assert/strict";
import test from "node:test";
import {
  buildCodexPrompt,
  validateProjectPlanInput
} from "../lib/promptBuilder";
import type { ProjectPlanInput } from "../types/project";

const validInput: ProjectPlanInput = {
  appName: "読書記録アプリ",
  appIdea: "読んだ本を記録し、感想と読了日をあとから見返せるアプリを作りたい。",
  targetUser: "読書習慣を管理したい個人",
  appType: "Webアプリ",
  developmentStack: "Next.js + TypeScript + Tailwind CSS",
  aiOption: "AIなし",
  storageOption: "SQLite + Prisma",
  features: "データ登録\n一覧表示\n検索",
  screens: "ホーム\n入力画面\n一覧画面",
  extraNotes: "初心者にも分かりやすいREADMEを用意してください。"
};

test("validateProjectPlanInput returns no errors for valid input", () => {
  assert.deepEqual(validateProjectPlanInput(validInput), []);
});

test("validateProjectPlanInput reports beginner-friendly validation errors", () => {
  const errors = validateProjectPlanInput({
    ...validInput,
    appName: "",
    appIdea: "短い",
    targetUser: ""
  });

  assert.deepEqual(errors, [
    "アプリ名を入力してください。",
    "このアプリで実現したいこと・主な機能は10文字以上で入力してください。",
    "使う人・利用シーンを入力してください。"
  ]);
});

test("buildCodexPrompt includes core sections and selected settings", () => {
  const prompt = buildCodexPrompt(validInput);

  assert.match(prompt, /あなたは優秀なフルスタックエンジニアです。/);
  assert.match(prompt, /Next\.js \+ TypeScript \+ Tailwind CSS を使って/);
  assert.match(prompt, /# このアプリで実現したいこと・主な機能/);
  assert.match(prompt, /# 使う人・利用シーン/);
  assert.match(prompt, /# 技術構成/);
  assert.match(prompt, /- 使用するAI：AI APIやローカルLLMは使わない/);
  assert.match(prompt, /- 保存方式：SQLite \+ Prisma/);
  assert.match(prompt, /- データ登録/);
  assert.match(prompt, /- 入力画面/);
  assert.match(prompt, /# 最終出力/);
});

test("buildCodexPrompt avoids awkward labels for unspecified settings", () => {
  const prompt = buildCodexPrompt({
    ...validInput,
    appType: "その他",
    developmentStack: "その他",
    aiOption: "未定",
    storageOption: "未定"
  });

  assert.match(prompt, /要件に合う開発環境を提案し/);
  assert.match(prompt, /その他（要件に合う形式を提案してください）/);
  assert.match(prompt, /未指定（要件に合う開発環境を提案してください）/);
  assert.match(
    prompt,
    /AI利用は必須にせず、必要な場合のみ候補として提案する/
  );
  assert.match(prompt, /保存方式は未定です。要件に合う保存方式を提案/);
});
