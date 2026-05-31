import assert from "node:assert/strict";
import test from "node:test";
import {
  createMockPlannerResult,
  suggestApiRoutes,
  suggestDatabaseModels,
  suggestFeatures,
  suggestScreens
} from "../lib/aiPlanner";
import type { ProjectPlanInput } from "../types/project";

const baseInput: ProjectPlanInput = {
  appName: "タスク管理アプリ",
  appIdea: "日々のタスクを登録し、完了状況を見返せるアプリを作りたい。",
  targetUser: "個人開発者",
  appType: "Webアプリ",
  developmentStack: "Next.js + TypeScript + Tailwind CSS",
  aiOption: "AIなし",
  storageOption: "SQLite + Prisma",
  features: "タスク登録\n完了チェック",
  screens: "ホーム\n一覧画面",
  extraNotes: ""
};

test("suggestFeatures and suggestScreens return entered items", async () => {
  assert.deepEqual(await suggestFeatures(baseInput), [
    "タスク登録",
    "完了チェック"
  ]);
  assert.deepEqual(await suggestScreens(baseInput), ["ホーム", "一覧画面"]);
});

test("suggestFeatures and suggestScreens return stable defaults when blank", async () => {
  const blankInput = {
    ...baseInput,
    features: "",
    screens: ""
  };

  assert.deepEqual(await suggestFeatures(blankInput), [
    "データ登録",
    "一覧表示",
    "編集",
    "削除"
  ]);
  assert.deepEqual(await suggestScreens(blankInput), [
    "ホーム",
    "入力画面",
    "一覧画面"
  ]);
});

test("mock planner returns future AI integration placeholders", async () => {
  const result = await createMockPlannerResult(baseInput, "prompt text");

  assert.equal(result.refinedAppIdea, baseInput.appIdea);
  assert.deepEqual(result.suggestedDatabaseModels, await suggestDatabaseModels());
  assert.deepEqual(result.suggestedApiRoutes, await suggestApiRoutes());
  assert.equal(result.improvedPrompt, "prompt text");
});
