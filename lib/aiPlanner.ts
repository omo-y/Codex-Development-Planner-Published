import type {
  AiPlannerResult,
  ProjectPlanInput,
  SuggestedApiRoute,
  SuggestedDatabaseModel
} from "@/types/project";

export async function refineAppIdea(appIdea: string): Promise<string> {
  return appIdea;
}

export async function suggestFeatures(
  input: ProjectPlanInput
): Promise<string[]> {
  const baseFeatures = input.features
    .split(/\r?\n/)
    .map((feature) => feature.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean);

  return baseFeatures.length > 0
    ? baseFeatures
    : ["データ登録", "一覧表示", "編集", "削除"];
}

export async function suggestScreens(
  input: ProjectPlanInput
): Promise<string[]> {
  const baseScreens = input.screens
    .split(/\r?\n/)
    .map((screen) => screen.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean);

  return baseScreens.length > 0
    ? baseScreens
    : ["ダッシュボード", "入力画面", "一覧画面"];
}

export async function suggestDatabaseModels(): Promise<
  SuggestedDatabaseModel[]
> {
  return [
    {
      name: "Item",
      fields: ["id", "title", "createdAt", "updatedAt"],
      purpose: "基本データを保存するためのモデル"
    }
  ];
}

export async function suggestApiRoutes(): Promise<SuggestedApiRoute[]> {
  return [
    {
      method: "GET",
      path: "/api/items",
      purpose: "一覧データを取得する"
    },
    {
      method: "POST",
      path: "/api/items",
      purpose: "新しいデータを保存する"
    }
  ];
}

export async function improveCodexPrompt(prompt: string): Promise<string> {
  return prompt;
}

export async function createMockPlannerResult(
  input: ProjectPlanInput,
  prompt: string
): Promise<AiPlannerResult> {
  return {
    refinedAppIdea: await refineAppIdea(input.appIdea),
    suggestedFeatures: await suggestFeatures(input),
    suggestedScreens: await suggestScreens(input),
    suggestedDatabaseModels: await suggestDatabaseModels(),
    suggestedApiRoutes: await suggestApiRoutes(),
    improvedPrompt: await improveCodexPrompt(prompt)
  };
}
