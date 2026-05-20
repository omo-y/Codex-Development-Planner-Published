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

export type AppIdeaPreset = {
  title: string;
  description: string;
  appType: AppType;
  developmentStack: DevelopmentStack;
  storageOption: StorageOption;
  targetUserHint: string;
  featureSuggestions: string[];
  screenSuggestions: string[];
};

export const APP_IDEA_PRESETS: AppIdeaPreset[] = [
  {
    title: "記録・管理アプリ",
    description: "家計簿、読書記録、学習記録、タスク管理など",
    appType: "Webアプリ",
    developmentStack: "Next.js + TypeScript + Tailwind CSS",
    storageOption: "SQLite + Prisma",
    targetUserHint: "例：毎日の記録をあとから見返したい個人",
    featureSuggestions: [
      "データ登録",
      "一覧表示",
      "編集",
      "削除",
      "検索",
      "カテゴリ分け",
      "履歴保存",
      "集計表示"
    ],
    screenSuggestions: ["ホーム", "入力画面", "一覧画面", "詳細画面", "設定画面"]
  },
  {
    title: "予約・受付アプリ",
    description: "予約管理、イベント受付、面談予約など",
    appType: "Webアプリ",
    developmentStack: "Next.js + TypeScript + Tailwind CSS",
    storageOption: "SQLite + Prisma",
    targetUserHint: "例：予約を受け付けたい個人事業主や小さなお店",
    featureSuggestions: [
      "予約登録",
      "予約一覧",
      "日時選択",
      "キャンセル",
      "検索",
      "管理者メモ",
      "ステータス管理"
    ],
    screenSuggestions: ["予約入力画面", "予約一覧画面", "詳細画面", "管理画面"]
  },
  {
    title: "学習・練習アプリ",
    description: "単語帳、問題集、学習進捗、復習ツールなど",
    appType: "Webアプリ",
    developmentStack: "Next.js + TypeScript + Tailwind CSS",
    storageOption: "SQLite + Prisma",
    targetUserHint: "例：学習を継続したい学生や社会人",
    featureSuggestions: [
      "教材登録",
      "問題表示",
      "正解チェック",
      "学習履歴",
      "進捗表示",
      "復習リスト",
      "検索"
    ],
    screenSuggestions: ["学習画面", "教材一覧", "進捗画面", "履歴画面", "設定画面"]
  },
  {
    title: "管理画面・業務ツール",
    description: "顧客管理、在庫管理、案件管理、社内メモなど",
    appType: "管理画面",
    developmentStack: "Next.js + TypeScript + Tailwind CSS",
    storageOption: "SQLite + Prisma",
    targetUserHint: "例：小さな業務を効率化したい個人やチーム",
    featureSuggestions: [
      "データ登録",
      "一覧表示",
      "編集",
      "削除",
      "検索",
      "ステータス管理",
      "メモ欄",
      "CSV出力"
    ],
    screenSuggestions: ["ダッシュボード", "登録画面", "一覧画面", "詳細画面", "設定画面"]
  },
  {
    title: "AI活用ツール",
    description: "文章整理、アイデア出し、要約、プロンプト作成など",
    appType: "AI実験ツール",
    developmentStack: "Next.js + TypeScript + Tailwind CSS",
    storageOption: "SQLite + Prisma",
    targetUserHint: "例：AIを使って作業を効率化したい個人",
    featureSuggestions: [
      "入力フォーム",
      "結果表示",
      "履歴保存",
      "コピー",
      "テンプレート選択",
      "再生成",
      "お気に入り保存"
    ],
    screenSuggestions: ["入力画面", "生成結果画面", "履歴画面", "設定画面"]
  },
  {
    title: "まだ決まっていない",
    description: "まずは無難なWebアプリとして整理する",
    appType: "Webアプリ",
    developmentStack: "Next.js + TypeScript + Tailwind CSS",
    storageOption: "SQLite + Prisma",
    targetUserHint: "例：自分、友人、家族、小さなチーム",
    featureSuggestions: ["データ登録", "一覧表示", "編集", "削除", "検索"],
    screenSuggestions: ["ホーム", "入力画面", "一覧画面"]
  }
];

export const COMMON_FEATURES = [
  "データ登録",
  "一覧表示",
  "編集",
  "削除",
  "検索",
  "並び替え",
  "カテゴリ分け",
  "履歴保存",
  "コピー",
  "CSV出力",
  "グラフ表示",
  "設定保存"
];

export const COMMON_SCREENS = [
  "ホーム",
  "入力画面",
  "一覧画面",
  "詳細画面",
  "編集画面",
  "ダッシュボード",
  "履歴画面",
  "設定画面"
];

export const BEGINNER_NOTES = [
  "初心者でも分かりやすいコードにしてください。",
  "READMEにインストール手順、起動手順、動作確認方法を書いてください。",
  "TypeScriptエラーが出ないようにしてください。",
  "エラー時は日本語で分かりやすく表示してください。"
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
