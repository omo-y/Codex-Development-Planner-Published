import type {
  AiOption,
  AppType,
  DevelopmentStack,
  StorageOption
} from "@/types/project";

export const APP_TYPES: AppType[] = [
  "Webアプリ",
  "スマホアプリ",
  "デスクトップアプリ",
  "AI実験ツール",
  "APIサーバー",
  "管理画面",
  "SaaS",
  "その他"
];

export const DEVELOPMENT_STACKS: DevelopmentStack[] = [
  "Next.js + TypeScript + Tailwind CSS",
  "React + Vite + TypeScript",
  "React Native / Expo",
  "Flutter",
  "Electron",
  "FastAPI",
  "Streamlit",
  "NestJS",
  "その他"
];

export const AI_OPTIONS: AiOption[] = [
  "AIなし",
  "OpenAI API",
  "Ollama",
  "Claude API",
  "Gemini API",
  "未定"
];

export const STORAGE_OPTIONS: StorageOption[] = [
  "DBなし",
  "localStorage",
  "SQLite + Prisma",
  "Supabase",
  "PostgreSQL",
  "Firebase",
  "未定"
];

export const DEVELOPMENT_STACK_NOTES: Record<DevelopmentStack, string[]> = {
  "Next.js + TypeScript + Tailwind CSS": [
    "Next.js App Routerを使う",
    "app/page.tsx を中心に実装する",
    "必要に応じて app/api/ にAPIルートを作る"
  ],
  "React + Vite + TypeScript": [
    "Vite + React + TypeScriptで実装する",
    "APIサーバーが必要な場合は別途説明する"
  ],
  "React Native / Expo": [
    "Expo + React Native + TypeScriptで実装する",
    "iOS / Androidで動くスマホアプリとして作る",
    "Web専用のAPIルートは使わない"
  ],
  Flutter: [
    "Flutter + Dartで実装する",
    "画面構成と状態管理を分かりやすくする"
  ],
  Electron: [
    "Electron + React + TypeScriptで実装する",
    "デスクトップアプリとして動く構成にする"
  ],
  FastAPI: [
    "Python + FastAPIでAPIサーバーを作る",
    "エンドポイント設計も含める"
  ],
  Streamlit: [
    "Python + Streamlitで実験用Webアプリを作る",
    "1ファイル構成でも動くようにする"
  ],
  NestJS: [
    "NestJS + TypeScriptでAPIサーバーを作る",
    "Controller、Service、Moduleを分ける"
  ],
  その他: ["選択した開発環境に合わせて、初心者にも分かる構成で実装する"]
};
