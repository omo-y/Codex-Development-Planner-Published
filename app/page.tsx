"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  AI_OPTIONS,
  APP_IDEA_PRESETS,
  APP_TYPES,
  BEGINNER_NOTES,
  COMMON_FEATURES,
  COMMON_SCREENS,
  DEVELOPMENT_STACKS,
  STORAGE_OPTIONS
} from "@/lib/templates";
import type { ProjectPlanInput, ProjectPlanResponse } from "@/types/project";

const defaultPreset = APP_IDEA_PRESETS[0];

const initialForm: ProjectPlanInput = {
  appName: "",
  appIdea: "",
  targetUser: "",
  appType: defaultPreset.appType,
  developmentStack: defaultPreset.developmentStack,
  aiOption: "AIなし",
  storageOption: defaultPreset.storageOption,
  features: defaultPreset.featureSuggestions.join("\n"),
  screens: defaultPreset.screenSuggestions.join("\n"),
  extraNotes: BEGINNER_NOTES.join("\n")
};

type AuthMode = "signin" | "signup";

type AuthSession = {
  accessToken: string;
  refreshToken?: string;
  email: string;
};

const AUTH_STORAGE_KEY = "codex-development-planner-session";

const seoFeatures = [
  "アプリ案の整理",
  "対象ユーザーの整理",
  "開発環境の選択",
  "使用AIの選択",
  "保存方式の選択",
  "Codex用プロンプト生成",
  "生成履歴の保存",
  "ユーザーごとの履歴管理"
];

const targetUsers = [
  "Codexを使ってアプリ開発を始めたい初心者",
  "個人開発者",
  "プログラミング経験は少ないが自分用アプリを作りたい人",
  "副業や学習目的で小さなアプリを作りたい人",
  "Codexへの指示文作成で迷う人"
];

const usageSteps = [
  "作りたいアプリの種類を選ぶ",
  "アプリ名や目的を入力する",
  "対象ユーザーを入力する",
  "開発環境や保存方式を選ぶ",
  "Codex用プロンプトを生成する",
  "生成したプロンプトをCodexアプリに貼り付ける"
];

const faqItems = [
  {
    question: "Codex開発プランナーとは何ですか？",
    answer:
      "作りたいアプリのアイデアを整理し、Codexに渡しやすい開発プロンプトを生成するWebアプリです。"
  },
  {
    question: "プログラミング初心者でも使えますか？",
    answer:
      "はい。対象ユーザー、必要機能、画面構成などを入力するだけで、Codex向けの指示文を作成できます。"
  },
  {
    question: "Codexアプリと何が違いますか？",
    answer:
      "Codexアプリはコード作成を支援します。Codex開発プランナーは、その前段階として要件や指示文を整理する補助ツールです。"
  },
  {
    question: "生成したプロンプトは保存できますか？",
    answer:
      "ログイン後、生成したプロンプト履歴を保存して後から見返せます。"
  },
  {
    question: "スマホでも使えますか？",
    answer:
      "Webアプリとしてスマホからも利用できます。PWA対応によりホーム画面に追加して使える構成も想定しています。"
  }
];

const presetVisualLabels: Record<string, string> = {
  "記録・管理アプリ": "記",
  "予約・受付アプリ": "予",
  "学習・練習アプリ": "学",
  "管理画面・業務ツール": "管",
  AI活用ツール: "AI",
  "まだ決まっていない": "?"
};

const quickNavigationItems = [
  {
    href: "#login",
    label: "ログイン"
  },
  {
    href: "#planner-form",
    label: "入力"
  },
  {
    href: "#generated-result",
    label: "生成結果"
  },
  {
    href: "#history",
    label: "履歴"
  },
  {
    href: "#usage-guide",
    label: "使い方"
  },
  {
    href: "#faq",
    label: "FAQ"
  }
];

function linesToItems(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean);
}

function itemsToLines(items: string[]) {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean))).join(
    "\n"
  );
}

function countMatches(leftItems: string[], rightItems: string[]) {
  const rightSet = new Set(rightItems);
  return leftItems.filter((item) => rightSet.has(item)).length;
}

function hasSameItems(leftItems: string[], rightItems: string[]) {
  const leftSet = new Set(leftItems);
  const rightSet = new Set(rightItems);

  if (leftSet.size !== rightSet.size) {
    return false;
  }

  return leftItems.every((item) => rightSet.has(item));
}

function findBestPresetTitle(project: ProjectPlanResponse) {
  const projectFeatures = linesToItems(project.features);
  const projectScreens = linesToItems(project.screens);

  const scoredPresets = APP_IDEA_PRESETS.map((preset) => {
    let score = 0;

    if (preset.appType === project.appType) {
      score += 3;
    }

    if (preset.developmentStack === project.developmentStack) {
      score += 2;
    }

    if (preset.storageOption === project.storageOption) {
      score += 2;
    }

    score += countMatches(preset.featureSuggestions, projectFeatures);
    score += countMatches(preset.screenSuggestions, projectScreens);

    if (hasSameItems(preset.featureSuggestions, projectFeatures)) {
      score += 5;
    }

    if (hasSameItems(preset.screenSuggestions, projectScreens)) {
      score += 5;
    }

    return {
      title: preset.title,
      score
    };
  });

  return scoredPresets.sort((left, right) => right.score - left.score)[0]?.title;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function getSupabaseBrowserConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase認証の環境変数が設定されていません。NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY を設定してください。"
    );
  }

  return {
    supabaseUrl,
    supabaseAnonKey
  };
}

function formatAuthErrorMessage(message: string) {
  const normalizedMessage = message.toLowerCase();

  if (
    normalizedMessage.includes("email rate limit") ||
    normalizedMessage.includes("rate limit")
  ) {
    return "短時間に何度も新規登録やメール送信を行ったため、Supabase側の制限により一時的に登録できません。しばらく時間をおいてから再度お試しください。開発中に何度も試す場合は、Supabaseで確認メールを無効にするか、SMTP設定の追加を検討してください。";
  }

  if (normalizedMessage.includes("invalid login credentials")) {
    return "メールアドレスまたはパスワードが正しくありません。入力内容を確認してください。";
  }

  if (normalizedMessage.includes("email not confirmed")) {
    return "メール確認が完了していません。Supabaseから届いた確認メールのリンクを開いてからログインしてください。";
  }

  if (normalizedMessage.includes("user already registered")) {
    return "このメールアドレスはすでに登録されています。ログインを選んでください。";
  }

  return message;
}

function buildStructuredData(siteUrl: string) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Codex開発プランナー",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      url: siteUrl,
      description:
        "作りたいアプリのアイデアを整理し、Codexアプリに貼り付けられる開発プロンプトを生成するAI開発補助ツールです。",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "JPY"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer
        }
      }))
    }
  ];
}

function loadStoredSession(): AuthSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawSession = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawSession) as AuthSession;
    return parsed.accessToken && parsed.email ? parsed : null;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

async function loadSessionFromUrlHash(): Promise<AuthSession | null> {
  if (typeof window === "undefined" || !window.location.hash) {
    return null;
  }

  const params = new URLSearchParams(window.location.hash.slice(1));
  const accessToken = params.get("access_token");

  if (!accessToken) {
    return null;
  }

  const refreshToken = params.get("refresh_token") ?? undefined;
  const { supabaseUrl, supabaseAnonKey } = getSupabaseBrowserConfig();
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${accessToken}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("メール確認後のログイン情報を確認できませんでした。もう一度ログインしてください。");
  }

  const user = (await response.json()) as {
    email?: string;
  };

  if (!user.email) {
    throw new Error("メール確認後のユーザー情報を確認できませんでした。もう一度ログインしてください。");
  }

  return {
    accessToken,
    refreshToken,
    email: user.email
  };
}

type OptionCardProps = {
  title: string;
  description: string;
  visualLabel: string;
  selected: boolean;
  onClick: () => void;
};

function OptionCard({
  title,
  description,
  visualLabel,
  selected,
  onClick
}: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[98px] gap-3 rounded-md border p-4 text-left transition ${
        selected
          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
          : "border-line bg-white hover:border-blue-300 hover:bg-slate-50"
      }`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border text-sm font-bold ${
          selected
            ? "border-blue-200 bg-white text-blue-700"
            : "border-line bg-slate-50 text-slate-700"
        }`}
        aria-hidden="true"
      >
        {visualLabel}
      </span>
      <span>
        <span className="block text-sm font-bold text-ink">{title}</span>
        <span className="mt-1 block text-xs leading-5 text-slate-600">
          {description}
        </span>
      </span>
    </button>
  );
}

type CheckboxGroupProps = {
  title: string;
  helper: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
};

function CheckboxGroup({
  title,
  helper,
  options,
  value,
  onChange
}: CheckboxGroupProps) {
  const selectedItems = linesToItems(value);
  const selectedSet = new Set(selectedItems);

  function toggle(option: string) {
    const nextItems = selectedSet.has(option)
      ? selectedItems.filter((item) => item !== option)
      : [...selectedItems, option];

    onChange(itemsToLines(nextItems));
  }

  return (
    <div>
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-slate-600">{helper}</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <label
            key={option}
            className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition ${
              selectedSet.has(option)
                ? "border-blue-400 bg-blue-50 text-blue-900"
                : "border-line bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <input
              type="checkbox"
              checked={selectedSet.has(option)}
              onChange={() => toggle(option)}
              className="h-4 w-4 rounded border-line text-blue-700"
            />
            {option}
          </label>
        ))}
      </div>
    </div>
  );
}

type SelectFieldProps = {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
};

function SelectField({ label, value, options, onChange }: SelectFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-ink">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-line bg-white px-3 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

type TextAreaFieldProps = {
  label: string;
  value: string;
  helper?: string;
  placeholder?: string;
  rows?: number;
  onChange: (value: string) => void;
};

function TextAreaField({
  label,
  value,
  helper,
  placeholder,
  rows = 5,
  onChange
}: TextAreaFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-ink">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-y rounded-md border border-line bg-white px-3 py-3 text-sm leading-6 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
      {helper ? (
        <span className="mt-2 block text-xs leading-5 text-slate-600">
          {helper}
        </span>
      ) : null}
    </label>
  );
}

export default function Home() {
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authSession, setAuthSession] = useState<AuthSession | null>(
    loadStoredSession
  );
  const [authMessage, setAuthMessage] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [form, setForm] = useState<ProjectPlanInput>(initialForm);
  const [selectedPresetTitle, setSelectedPresetTitle] = useState(
    defaultPreset.title
  );
  const [customFeatures, setCustomFeatures] = useState("");
  const [customScreens, setCustomScreens] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [history, setHistory] = useState<ProjectPlanResponse[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const featureOptions = useMemo(() => {
    const preset = APP_IDEA_PRESETS.find(
      (item) => item.title === selectedPresetTitle
    );
    return itemsToLines([
      ...(preset?.featureSuggestions ?? []),
      ...COMMON_FEATURES,
      ...linesToItems(form.features)
    ]).split("\n");
  }, [form.features, selectedPresetTitle]);

  const screenOptions = useMemo(() => {
    const preset = APP_IDEA_PRESETS.find(
      (item) => item.title === selectedPresetTitle
    );
    return itemsToLines([
      ...(preset?.screenSuggestions ?? []),
      ...COMMON_SCREENS,
      ...linesToItems(form.screens)
    ]).split("\n");
  }, [form.screens, selectedPresetTitle]);

  const selectedPreset = APP_IDEA_PRESETS.find(
    (item) => item.title === selectedPresetTitle
  );
  const canCopy = generatedPrompt.trim().length > 0;
  const requiredFields = [
    {
      label: "アプリ名",
      completed: form.appName.trim().length > 0
    },
    {
      label: "実現したいこと",
      completed: form.appIdea.trim().length >= 10
    },
    {
      label: "使う人",
      completed: form.targetUser.trim().length > 0
    }
  ];
  const completedRequiredFields = requiredFields.filter(
    (field) => field.completed
  ).length;
  const isPromptReady = completedRequiredFields === requiredFields.length;
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000")
    .replace(/\/$/, "");
  const structuredData = buildStructuredData(siteUrl);

  function getAuthHeaders(): Record<string, string> {
    return authSession
      ? {
          Authorization: `Bearer ${authSession.accessToken}`
        }
      : {};
  }

  useEffect(() => {
    let isMounted = true;

    loadSessionFromUrlHash()
      .then((session) => {
        if (!isMounted || !session) {
          return;
        }

        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
        window.history.replaceState(
          null,
          "",
          `${window.location.pathname}${window.location.search}`
        );
        setAuthSession(session);
        setAuthEmail("");
        setAuthPassword("");
        setSuccessMessage("メール確認が完了し、ログインしました。");
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        window.history.replaceState(
          null,
          "",
          `${window.location.pathname}${window.location.search}`
        );
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "メール確認後のログイン処理に失敗しました。"
        );
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function loadHistory() {
    if (!authSession) {
      setHistory([]);
      return;
    }

    setIsLoadingHistory(true);
    try {
      const response = await fetch("/api/projects", {
        method: "GET",
        headers: getAuthHeaders(),
        cache: "no-store"
      });
      const data = (await response.json()) as {
        projects?: ProjectPlanResponse[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "履歴の取得に失敗しました。");
      }

      setHistory(data.projects ?? []);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "履歴の取得に失敗しました。"
      );
    } finally {
      setIsLoadingHistory(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    if (!authSession) {
      return () => {
        isMounted = false;
      };
    }

    fetch("/api/projects", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authSession.accessToken}`
      },
      cache: "no-store"
    })
      .then(async (response) => {
        const data = (await response.json()) as {
          projects?: ProjectPlanResponse[];
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error ?? "履歴の取得に失敗しました。");
        }

        if (isMounted) {
          setHistory(data.projects ?? []);
        }
      })
      .catch((error) => {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "履歴の取得に失敗しました。"
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingHistory(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [authSession]);

  async function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setAuthMessage("");
    setIsAuthenticating(true);

    try {
      const { supabaseUrl, supabaseAnonKey } = getSupabaseBrowserConfig();
      const endpoint =
        authMode === "signin"
          ? `${supabaseUrl}/auth/v1/token?grant_type=password`
          : `${supabaseUrl}/auth/v1/signup?redirect_to=${encodeURIComponent(
              `${siteUrl}/`
            )}`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          apikey: supabaseAnonKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: authEmail,
          password: authPassword
        })
      });
      const data = (await response.json()) as {
        access_token?: string;
        refresh_token?: string;
        user?: {
          email?: string;
        };
        msg?: string;
        error_description?: string;
      };

      if (!response.ok) {
        const authErrorMessage =
          data.error_description ??
          data.msg ??
          "ログインまたはユーザー登録に失敗しました。";

        throw new Error(
          formatAuthErrorMessage(authErrorMessage)
        );
      }

      if (!data.access_token) {
        setAuthMessage(
          "登録を受け付けました。Supabaseの設定によっては、確認メールのリンクを開いてからログインしてください。"
        );
        return;
      }

      const nextSession: AuthSession = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        email: data.user?.email ?? authEmail
      };

      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession));
      setAuthSession(nextSession);
      setAuthPassword("");
      setSuccessMessage("ログインしました。履歴はこのユーザーのものだけ表示されます。");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "ログインまたはユーザー登録に失敗しました。"
      );
    } finally {
      setIsAuthenticating(false);
    }
  }

  function handleSignOut() {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuthSession(null);
    setHistory([]);
    setGeneratedPrompt("");
    setSuccessMessage("ログアウトしました。");
  }

  async function handleDeleteAccount() {
    setErrorMessage("");
    setSuccessMessage("");

    if (!authSession) {
      setErrorMessage("アカウント削除にはログインが必要です。");
      return;
    }

    const confirmed = window.confirm(
      "アカウントと生成履歴を削除します。この操作は元に戻せません。削除しますか？"
    );

    if (!confirmed) {
      return;
    }

    setIsDeletingAccount(true);

    try {
      const response = await fetch("/api/account", {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "アカウント削除に失敗しました。");
      }

      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      setAuthSession(null);
      setHistory([]);
      setGeneratedPrompt("");
      setAuthEmail("");
      setAuthPassword("");
      setSuccessMessage("アカウントと生成履歴を削除しました。");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "アカウント削除に失敗しました。時間をおいてもう一度お試しください。"
      );
    } finally {
      setIsDeletingAccount(false);
    }
  }

  function updateForm<K extends keyof ProjectPlanInput>(
    key: K,
    value: ProjectPlanInput[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value
    }));
  }

  function applyPreset(title: string) {
    const preset = APP_IDEA_PRESETS.find((item) => item.title === title);

    if (!preset) {
      return;
    }

    setSelectedPresetTitle(preset.title);
    setForm((current) => ({
      ...current,
      appType: preset.appType,
      developmentStack: preset.developmentStack,
      storageOption: preset.storageOption,
      features: itemsToLines(preset.featureSuggestions),
      screens: itemsToLines(preset.screenSuggestions)
    }));
    setCustomFeatures("");
    setCustomScreens("");
  }

  function appendCustomItems(
    target: "features" | "screens",
    customValue: string,
    clear: () => void
  ) {
    const customItems = linesToItems(customValue);

    if (customItems.length === 0) {
      return;
    }

    setForm((current) => ({
      ...current,
      [target]: itemsToLines([...linesToItems(current[target]), ...customItems])
    }));
    clear();
  }

  function restoreHistory(project: ProjectPlanResponse) {
    setForm({
      appName: project.appName,
      appIdea: project.appIdea,
      targetUser: project.targetUser,
      appType: project.appType,
      developmentStack: project.developmentStack,
      aiOption: project.aiOption,
      storageOption: project.storageOption,
      features: project.features,
      screens: project.screens,
      extraNotes: project.extraNotes
    });
    setSelectedPresetTitle(findBestPresetTitle(project) ?? defaultPreset.title);
    setCustomFeatures("");
    setCustomScreens("");
    setGeneratedPrompt(project.generatedPrompt);
    setErrorMessage("");
    setSuccessMessage("履歴から入力内容を復元しました。");
  }

  function buildSubmitInput(): ProjectPlanInput {
    return {
      ...form,
      features: itemsToLines([
        ...linesToItems(form.features),
        ...linesToItems(customFeatures)
      ]),
      screens: itemsToLines([
        ...linesToItems(form.screens),
        ...linesToItems(customScreens)
      ])
    };
  }

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!authSession) {
      setErrorMessage("履歴保存にはログインが必要です。先にログインしてください。");
      return;
    }

    setIsGenerating(true);

    const submitInput = buildSubmitInput();

    try {
      const promptResponse = await fetch("/api/prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(submitInput)
      });
      const promptData = (await promptResponse.json()) as {
        generatedPrompt?: string;
        error?: string;
      };

      if (!promptResponse.ok || !promptData.generatedPrompt) {
        throw new Error(
          promptData.error ?? "プロンプトの生成に失敗しました。"
        );
      }

      setGeneratedPrompt(promptData.generatedPrompt);
      setForm(submitInput);
      setCustomFeatures("");
      setCustomScreens("");

      const saveResponse = await fetch("/api/projects", {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...submitInput,
          generatedPrompt: promptData.generatedPrompt
        })
      });
      const saveData = (await saveResponse.json()) as {
        error?: string;
      };

      if (!saveResponse.ok) {
        setErrorMessage(
          saveData.error ??
            "履歴の保存に失敗しました。生成されたプロンプトは表示されています。"
        );
        return;
      }

      setSuccessMessage("Codex用プロンプトを生成し、履歴に保存しました。");
      await loadHistory();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "プロンプトの生成に失敗しました。"
      );
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleCopy() {
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setSuccessMessage("生成されたプロンプトをコピーしました。");
    } catch {
      setErrorMessage(
        "コピーに失敗しました。ブラウザの権限設定を確認してください。"
      );
    }
  }

  async function handleDelete(id: string) {
    setErrorMessage("");
    setSuccessMessage("");

    if (!authSession) {
      setErrorMessage("履歴削除にはログインが必要です。");
      return;
    }

    try {
      const response = await fetch(`/api/projects?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "履歴の削除に失敗しました。");
      }

      setSuccessMessage("履歴を削除しました。");
      await loadHistory();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "履歴の削除に失敗しました。"
      );
    }
  }

  return (
    <main id="top" className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <header className="border-b border-line pb-6">
          <p className="text-sm font-semibold text-blue-700">
            Codex開発プランナー
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-normal text-ink sm:text-4xl">
            Codexでアプリ開発を始めるためのプロンプト設計ツール
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-700">
            Codex開発プランナーは、作りたいアプリのアイデアを、Codexに渡しやすい開発指示書へ整理するWebアプリです。対象ユーザー、必要機能、画面構成、開発環境、保存方式を整理し、Codexアプリに貼り付けられるプロンプトを生成できます。
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-slate-700">
            <span className="rounded-md bg-blue-50 px-3 py-2 text-blue-700">
              Codex プロンプト生成
            </span>
            <span className="rounded-md bg-slate-100 px-3 py-2">
              アプリ開発 初心者向け
            </span>
            <span className="rounded-md bg-slate-100 px-3 py-2">
              個人開発の要件整理
            </span>
          </div>
        </header>

        {(errorMessage || successMessage) && (
          <div
            className={`rounded-md border px-4 py-3 text-sm ${
              errorMessage
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
          >
            {errorMessage || successMessage}
          </div>
        )}

        <nav
          aria-label="ページ内移動"
          className="rounded-md border border-line bg-white p-3"
        >
          <div className="flex flex-wrap gap-2">
            {quickNavigationItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-md border border-line bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                {item.label}
              </a>
            ))}
          </div>
        </nav>

        <section
          id="login"
          className="scroll-mt-4 rounded-md border border-line bg-white p-4 sm:p-6"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-ink">ログイン</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                生成履歴はログイン中のユーザーごとに保存されます。プロンプト生成と履歴保存にはログインが必要です。
              </p>
              {authSession ? (
                <p className="mt-2 text-sm font-semibold text-blue-700">
                  ログイン中: {authSession.email}
                </p>
              ) : null}
            </div>

            {authSession ? (
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isDeletingAccount}
                  className="rounded-md border border-line px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-mist disabled:cursor-not-allowed disabled:text-slate-400"
                >
                  ログアウト
                </button>
                <button
                  type="button"
                  onClick={() => void handleDeleteAccount()}
                  disabled={isDeletingAccount}
                  className="rounded-md border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:text-red-300"
                >
                  {isDeletingAccount ? "削除中..." : "アカウント削除"}
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleAuthSubmit}
                className="grid w-full gap-3 lg:max-w-md"
              >
                <div>
                  <p className="mb-2 text-xs font-semibold text-slate-600">
                    先に操作を選んでください
                  </p>
                  <div className="grid grid-cols-2 rounded-md border border-line bg-slate-50 p-1">
                    <button
                      type="button"
                      onClick={() => setAuthMode("signin")}
                      aria-pressed={authMode === "signin"}
                      className={`rounded px-3 py-2 text-sm font-semibold transition ${
                        authMode === "signin"
                          ? "border border-blue-200 bg-white text-blue-700 shadow-sm"
                          : "text-slate-600 hover:bg-white"
                      }`}
                    >
                      {authMode === "signin" ? "ログインを選択中" : "ログイン"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMode("signup")}
                      aria-pressed={authMode === "signup"}
                      className={`rounded px-3 py-2 text-sm font-semibold transition ${
                        authMode === "signup"
                          ? "border border-blue-200 bg-white text-blue-700 shadow-sm"
                          : "text-slate-600 hover:bg-white"
                      }`}
                    >
                      {authMode === "signup" ? "新規登録を選択中" : "新規登録"}
                    </button>
                  </div>
                </div>
                <input
                  type="email"
                  value={authEmail}
                  onChange={(event) => setAuthEmail(event.target.value)}
                  placeholder="メールアドレス"
                  className="w-full rounded-md border border-line bg-white px-3 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />
                <input
                  type="password"
                  value={authPassword}
                  onChange={(event) => setAuthPassword(event.target.value)}
                  placeholder="パスワード"
                  className="w-full rounded-md border border-line bg-white px-3 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                  minLength={6}
                />
                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="rounded-md bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {isAuthenticating
                    ? "処理中..."
                    : authMode === "signin"
                      ? "ログインを実行"
                      : "アカウントを作成"}
                </button>
                {authMessage ? (
                  <p className="text-xs leading-5 text-slate-600">{authMessage}</p>
                ) : null}
              </form>
            )}
          </div>
        </section>

        <form
          id="planner-form"
          onSubmit={handleGenerate}
          className="scroll-mt-4 grid gap-6 rounded-md border border-line bg-mist p-4 sm:p-6 lg:grid-cols-[1.05fr_0.95fr]"
        >
          <section className="space-y-6">
            <div className="rounded-md border border-line bg-white p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-bold text-ink">
                    入力の進捗
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    必須項目 {completedRequiredFields}/{requiredFields.length} 入力済み。すべて入力すると生成できます。
                  </p>
                </div>
                <span
                  className={`rounded-md px-3 py-2 text-sm font-semibold ${
                    isPromptReady
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {isPromptReady ? "生成準備OK" : "入力途中"}
                </span>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {requiredFields.map((field) => (
                  <div
                    key={field.label}
                    className={`rounded-md border px-3 py-2 text-sm ${
                      field.completed
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-line bg-slate-50 text-slate-600"
                    }`}
                  >
                    <span className="font-semibold">
                      {field.completed ? "完了" : "未入力"}
                    </span>
                    <span className="ml-2">{field.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-md border border-blue-100 bg-white p-4">
              <h2 className="text-base font-bold text-ink">
                1. まず、作りたいものに近いものを選んでください
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                技術名が分からなくても大丈夫です。選んだ内容に合わせて、おすすめの機能・画面・保存方式を自動で入れます。
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {APP_IDEA_PRESETS.map((preset) => (
                  <OptionCard
                    key={preset.title}
                    title={preset.title}
                    description={preset.description}
                    visualLabel={presetVisualLabels[preset.title] ?? "APP"}
                    selected={selectedPresetTitle === preset.title}
                    onClick={() => applyPreset(preset.title)}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-5 rounded-md border border-line bg-white p-4">
              <h2 className="text-base font-bold text-ink">
                2. 作りたいアプリを具体化してください
              </h2>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-ink">
                  アプリ名
                </span>
                <input
                  value={form.appName}
                  onChange={(event) =>
                    updateForm("appName", event.target.value)
                  }
                  placeholder="例：シンプル家計簿、読書記録アプリ、学習管理アプリ"
                  className="w-full rounded-md border border-line bg-white px-3 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <TextAreaField
                label="このアプリで実現したいこと・主な機能"
                value={form.appIdea}
                onChange={(value) => updateForm("appIdea", value)}
                helper="選んだ分類をもとに、具体的にできることを書いてください。例：毎日の支出を登録し、月別合計やカテゴリ別の支出を確認できる。"
                placeholder="例：毎日の支出を記録し、月ごとの合計やカテゴリ別の支出を見返せる家計簿アプリを作りたい。"
                rows={5}
              />

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-ink">
                  使う人・利用シーン
                </span>
                <input
                  value={form.targetUser}
                  onChange={(event) =>
                    updateForm("targetUser", event.target.value)
                  }
                  placeholder={
                    selectedPreset?.targetUserHint ??
                    "例：自分、学生、会社員、小さなお店"
                  }
                  className="w-full rounded-md border border-line bg-white px-3 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <span className="mt-2 block text-xs leading-5 text-slate-600">
                  誰が、どんな場面で使うかを書いてください。例：毎月の支出を見直したい個人・学生・会社員。
                </span>
              </label>
            </div>

            <div className="space-y-6 rounded-md border border-line bg-white p-4">
              <h2 className="text-base font-bold text-ink">
                3. 必要そうなものを選んでください
              </h2>

              <CheckboxGroup
                title="必要機能"
                helper="最初から全部入れる必要はありません。迷ったら、すでに選ばれている項目のままで大丈夫です。"
                options={featureOptions}
                value={form.features}
                onChange={(value) => updateForm("features", value)}
              />

              <div className="rounded-md bg-slate-50 p-3">
                <TextAreaField
                  label="追加したい機能があれば入力"
                  value={customFeatures}
                  onChange={setCustomFeatures}
                  placeholder="例：月ごとの合計、タグ管理、印刷"
                  rows={3}
                />
                <button
                  type="button"
                  onClick={() =>
                    appendCustomItems("features", customFeatures, () =>
                      setCustomFeatures("")
                    )
                  }
                  className="mt-2 rounded-md border border-line bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  機能リストに追加
                </button>
                <p className="mt-2 text-xs leading-5 text-slate-600">
                  追加すると、上の必要機能リストにチェック済み項目として表示されます。
                </p>
              </div>

              <CheckboxGroup
                title="画面構成"
                helper="ユーザーが実際に見る画面を選びます。分からない場合は、おすすめのままで進めてください。"
                options={screenOptions}
                value={form.screens}
                onChange={(value) => updateForm("screens", value)}
              />

              <div className="rounded-md bg-slate-50 p-3">
                <TextAreaField
                  label="追加したい画面があれば入力"
                  value={customScreens}
                  onChange={setCustomScreens}
                  placeholder="例：月別レポート画面、プロフィール画面"
                  rows={3}
                />
                <button
                  type="button"
                  onClick={() =>
                    appendCustomItems("screens", customScreens, () =>
                      setCustomScreens("")
                    )
                  }
                  className="mt-2 rounded-md border border-line bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  画面リストに追加
                </button>
                <p className="mt-2 text-xs leading-5 text-slate-600">
                  追加すると、上の画面構成リストにチェック済み項目として表示されます。
                </p>
              </div>
            </div>

            <details className="rounded-md border border-line bg-white p-4">
              <summary className="cursor-pointer text-sm font-bold text-ink">
                詳細設定：技術構成を自分で変更する
              </summary>
              <p className="mt-2 text-xs leading-5 text-slate-600">
                初期リリースでは初心者向けのおすすめ設定を標準にしています。細かく変えたい場合だけ開いてください。
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <SelectField
                  label="アプリの種類"
                  value={form.appType}
                  options={APP_TYPES}
                  onChange={(value) =>
                    updateForm("appType", value as ProjectPlanInput["appType"])
                  }
                />
                <SelectField
                  label="開発環境"
                  value={form.developmentStack}
                  options={DEVELOPMENT_STACKS}
                  onChange={(value) =>
                    updateForm(
                      "developmentStack",
                      value as ProjectPlanInput["developmentStack"]
                    )
                  }
                />
                <SelectField
                  label="使用するAI"
                  value={form.aiOption}
                  options={AI_OPTIONS}
                  onChange={(value) =>
                    updateForm("aiOption", value as ProjectPlanInput["aiOption"])
                  }
                />
                <SelectField
                  label="保存方式"
                  value={form.storageOption}
                  options={STORAGE_OPTIONS}
                  onChange={(value) =>
                    updateForm(
                      "storageOption",
                      value as ProjectPlanInput["storageOption"]
                    )
                  }
                />
              </div>
            </details>

            <TextAreaField
              label="追加したい注意点"
              value={form.extraNotes ?? ""}
              onChange={(value) => updateForm("extraNotes", value)}
              rows={5}
            />

            <button
              type="submit"
              disabled={isGenerating || !authSession}
              className="w-full rounded-md bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-auto"
            >
              {isGenerating
                ? "生成中..."
                : authSession
                  ? "Codex用プロンプトを生成"
                  : "ログインすると生成できます"}
            </button>
          </section>

          <section
            id="generated-result"
            className="flex min-h-[520px] scroll-mt-4 flex-col"
          >
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-ink">生成結果</h2>
                <p className="mt-1 text-sm text-slate-600">
                  {canCopy
                    ? "生成済みです。コピーしてCodexアプリに貼り付けられます。"
                    : "必須項目を入力して生成すると、ここにCodex用プロンプトが表示されます。"}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!canCopy}
                className="rounded-md border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-line disabled:text-slate-400"
              >
                コピー
              </button>
            </div>
            <div
              className={`mb-3 rounded-md border px-4 py-3 text-sm ${
                canCopy
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-blue-100 bg-blue-50 text-blue-800"
              }`}
            >
              {canCopy
                ? "生成完了。内容を確認してからコピーしてください。"
                : "未生成。左側の入力欄を埋めて「Codex用プロンプトを生成」を押してください。"}
              {canCopy ? (
                <a
                  href="#history"
                  className="ml-0 mt-2 inline-flex rounded-md border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 sm:ml-3 sm:mt-0"
                >
                  履歴を見る
                </a>
              ) : null}
            </div>
            <textarea
              value={generatedPrompt}
              onChange={(event) => setGeneratedPrompt(event.target.value)}
              placeholder="ここにCodex用プロンプトが表示されます。"
              className="min-h-[480px] flex-1 resize-y rounded-md border border-line bg-white p-4 text-sm leading-6 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <div className="mt-4 rounded-md border border-blue-100 bg-white p-4">
              <h3 className="text-sm font-bold text-ink">
                生成結果の使い方
              </h3>
              <ol className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                <li>1. 内容を確認し、足りない条件があれば左側の入力欄を修正します。</li>
                <li>2. 「コピー」を押して、生成されたプロンプトをコピーします。</li>
                <li>3. Codexアプリで新しい作業を開き、そのまま貼り付けます。</li>
                <li>4. Codexの返答を見て、必要なら追加条件をもう一度入力して再生成します。</li>
              </ol>
              <p className="mt-3 text-xs leading-5 text-slate-600">
                生成結果は完成した仕様書ではなく、Codexに最初の実装を依頼するための下書きです。実装後に気になる点があれば、履歴から復元して条件を追加してください。
              </p>
              <div className="mt-4 rounded-md bg-blue-50 p-3">
                <h4 className="text-sm font-bold text-ink">
                  Codexアプリが初めての方へ
                </h4>
                <p className="mt-2 text-xs leading-5 text-slate-700">
                  このアプリで作るものは、Codexに渡すための開発指示書です。Codexアプリでは、その指示書を使って実際のファイル作成やコード編集を進めます。
                </p>
                <a
                  href="https://openai.com/ja-JP/index/introducing-the-codex-app/"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex rounded-md bg-blue-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-800"
                >
                  Codexアプリの公式紹介を見る
                </a>
              </div>
            </div>
          </section>
        </form>

        <section
          id="history"
          className="scroll-mt-4 rounded-md border border-line bg-white p-4 sm:p-6"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-ink">生成履歴</h2>
              <p className="mt-1 text-sm text-slate-600">
                最新5件を表示します。クリックすると入力欄に復元できます。
              </p>
            </div>
            <button
              type="button"
              onClick={() => void loadHistory()}
              disabled={!authSession}
              className="rounded-md border border-line px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-mist"
            >
              更新
            </button>
          </div>

          {!authSession ? (
            <p className="rounded-md bg-mist p-4 text-sm text-slate-600">
              ログインすると、自分の生成履歴だけが表示されます。
            </p>
          ) : isLoadingHistory ? (
            <p className="rounded-md bg-mist p-4 text-sm text-slate-600">
              履歴を読み込んでいます。
            </p>
          ) : history.length === 0 ? (
            <p className="rounded-md bg-mist p-4 text-sm text-slate-600">
              まだ生成履歴はありません。
            </p>
          ) : (
            <>
              <div className="grid gap-3 md:hidden">
                {history.map((project) => (
                  <article
                    key={project.id}
                    className="rounded-md border border-line bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-ink">
                          {project.appName}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatDate(project.createdAt)}
                        </p>
                      </div>
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                        {project.appType}
                      </span>
                    </div>
                    <dl className="mt-4 grid gap-2 text-sm text-slate-700">
                      <div>
                        <dt className="text-xs font-semibold text-slate-500">
                          開発環境
                        </dt>
                        <dd className="mt-1">{project.developmentStack}</dd>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <dt className="text-xs font-semibold text-slate-500">
                            AI
                          </dt>
                          <dd className="mt-1">{project.aiOption}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-semibold text-slate-500">
                            保存方式
                          </dt>
                          <dd className="mt-1">{project.storageOption}</dd>
                        </div>
                      </div>
                    </dl>
                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => restoreHistory(project)}
                        className="flex-1 rounded-md bg-blue-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
                      >
                        復元
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(project.id)}
                        className="rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                      >
                        削除
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-slate-600">
                    <th className="py-3 pr-4 font-semibold">作成日時</th>
                    <th className="py-3 pr-4 font-semibold">アプリ名</th>
                    <th className="py-3 pr-4 font-semibold">種類</th>
                    <th className="py-3 pr-4 font-semibold">開発環境</th>
                    <th className="py-3 pr-4 font-semibold">AI</th>
                    <th className="py-3 pr-4 font-semibold">保存方式</th>
                    <th className="py-3 font-semibold">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((project) => (
                    <tr
                      key={project.id}
                      className="border-b border-line last:border-0"
                    >
                      <td className="py-3 pr-4 text-slate-700">
                        {formatDate(project.createdAt)}
                      </td>
                      <td className="py-3 pr-4 font-semibold text-ink">
                        {project.appName}
                      </td>
                      <td className="py-3 pr-4 text-slate-700">
                        {project.appType}
                      </td>
                      <td className="py-3 pr-4 text-slate-700">
                        {project.developmentStack}
                      </td>
                      <td className="py-3 pr-4 text-slate-700">
                        {project.aiOption}
                      </td>
                      <td className="py-3 pr-4 text-slate-700">
                        {project.storageOption}
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => restoreHistory(project)}
                            className="rounded-md bg-blue-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
                          >
                            復元
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(project.id)}
                            className="rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                          >
                            削除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                </table>
              </div>
            </>
          )}
        </section>

        <section
          id="usage-guide"
          className="scroll-mt-4 rounded-md border border-line bg-white p-4 sm:p-6"
        >
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-blue-700">
              AI開発補助ツールとしての使い方
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-normal text-ink">
              Codexプロンプト生成の前に、アプリ開発の要件整理を進められます
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              Codex開発プランナーは、AIコーディングを始める前に、作りたいアプリの目的、対象ユーザー、必要機能、画面構成を整理するためのWebアプリです。個人開発や学習目的の小さなアプリでも、最初の指示文を整えることで、Codexアプリへ依頼しやすくなります。
            </p>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="rounded-md bg-mist p-4">
              <h3 className="text-base font-bold text-ink">主な機能</h3>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                {seoFeatures.map((feature) => (
                  <li key={feature}>- {feature}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-md bg-mist p-4">
              <h3 className="text-base font-bold text-ink">対象ユーザー</h3>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                {targetUsers.map((user) => (
                  <li key={user}>- {user}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-md bg-mist p-4">
              <h3 className="text-base font-bold text-ink">使い方</h3>
              <ol className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                {usageSteps.map((step, index) => (
                  <li key={step}>
                    {index + 1}. {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section
          id="faq"
          className="scroll-mt-4 rounded-md border border-line bg-white p-4 sm:p-6"
        >
          <h2 className="text-2xl font-bold tracking-normal text-ink">FAQ</h2>
          <div className="mt-5 grid gap-3">
            {faqItems.map((item) => (
              <details
                key={item.question}
                className="rounded-md border border-line bg-white p-4"
              >
                <summary className="cursor-pointer text-sm font-bold text-ink">
                  {item.question}
                </summary>
                <p className="mt-3 text-sm leading-7 text-slate-700">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        <footer className="flex flex-col gap-3 border-t border-line py-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>Codex開発プランナー</p>
          <div className="flex gap-4">
            <a className="hover:text-blue-700" href="/privacy">
              プライバシーポリシー
            </a>
            <a className="hover:text-blue-700" href="/terms">
              利用規約
            </a>
          </div>
        </footer>
      </div>
      <a
        href="#generated-result"
        className="fixed bottom-16 right-4 rounded-md border border-blue-200 bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
        aria-label="生成結果へ移動"
      >
        生成結果へ
      </a>
      <a
        href="#top"
        className="fixed bottom-4 right-4 rounded-md border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
        aria-label="ページ上部へ戻る"
      >
        TOPへ戻る
      </a>
    </main>
  );
}
