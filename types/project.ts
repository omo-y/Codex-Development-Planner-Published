export type AppType =
  | "Webアプリ"
  | "スマホアプリ"
  | "デスクトップアプリ"
  | "AI実験ツール"
  | "APIサーバー"
  | "管理画面"
  | "SaaS"
  | "その他";

export type DevelopmentStack =
  | "Next.js + TypeScript + Tailwind CSS"
  | "React + Vite + TypeScript"
  | "React Native / Expo"
  | "Flutter"
  | "Electron"
  | "FastAPI"
  | "Streamlit"
  | "NestJS"
  | "その他";

export type AiOption =
  | "AIなし"
  | "OpenAI API"
  | "Ollama"
  | "Claude API"
  | "Gemini API"
  | "未定";

export type StorageOption =
  | "DBなし"
  | "localStorage"
  | "SQLite + Prisma"
  | "Supabase"
  | "PostgreSQL"
  | "Firebase"
  | "未定";

export type ProjectPlanInput = {
  appName: string;
  appIdea: string;
  targetUser: string;
  appType: AppType;
  developmentStack: DevelopmentStack;
  aiOption: AiOption;
  storageOption: StorageOption;
  features: string;
  screens: string;
  extraNotes?: string;
};

export type ProjectPlanResponse = ProjectPlanInput & {
  id: string;
  createdAt: string;
  updatedAt: string;
  generatedPrompt: string;
};

export type SuggestedDatabaseModel = {
  name: string;
  fields: string[];
  purpose: string;
};

export type SuggestedApiRoute = {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  purpose: string;
};

export type AiPlannerResult = {
  refinedAppIdea?: string;
  suggestedFeatures?: string[];
  suggestedScreens?: string[];
  suggestedDatabaseModels?: SuggestedDatabaseModel[];
  suggestedApiRoutes?: SuggestedApiRoute[];
  improvedPrompt?: string;
};
