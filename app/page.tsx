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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

type OptionCardProps = {
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
};

function OptionCard({ title, description, selected, onClick }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md border p-4 text-left transition ${
        selected
          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
          : "border-line bg-white hover:border-blue-300 hover:bg-slate-50"
      }`}
    >
      <span className="block text-sm font-bold text-ink">{title}</span>
      <span className="mt-1 block text-xs leading-5 text-slate-600">
        {description}
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
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const featureOptions = useMemo(() => {
    const preset = APP_IDEA_PRESETS.find(
      (item) => item.title === selectedPresetTitle
    );
    return itemsToLines([
      ...(preset?.featureSuggestions ?? []),
      ...COMMON_FEATURES
    ]).split("\n");
  }, [selectedPresetTitle]);

  const screenOptions = useMemo(() => {
    const preset = APP_IDEA_PRESETS.find(
      (item) => item.title === selectedPresetTitle
    );
    return itemsToLines([
      ...(preset?.screenSuggestions ?? []),
      ...COMMON_SCREENS
    ]).split("\n");
  }, [selectedPresetTitle]);

  const selectedPreset = APP_IDEA_PRESETS.find(
    (item) => item.title === selectedPresetTitle
  );
  const canCopy = generatedPrompt.trim().length > 0;

  async function loadHistory() {
    setIsLoadingHistory(true);
    try {
      const response = await fetch("/api/projects", {
        method: "GET",
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

    fetch("/api/projects", {
      method: "GET",
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
  }, []);

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
    setSelectedPresetTitle("まだ決まっていない");
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

    try {
      const response = await fetch(`/api/projects?id=${encodeURIComponent(id)}`, {
        method: "DELETE"
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
    <main className="min-h-screen bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <header className="border-b border-line pb-6">
          <p className="text-sm font-semibold text-blue-700">
            Codex prompt planning tool
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-normal text-ink sm:text-4xl">
            Codex開発プランナー
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-700">
            作りたいアプリのアイデアを入力すると、要件・機能・画面構成・開発環境を整理し、Codexアプリに貼り付けられる開発プロンプトを生成します。
          </p>
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

        <form
          onSubmit={handleGenerate}
          className="grid gap-6 rounded-md border border-line bg-mist p-4 sm:p-6 lg:grid-cols-[1.05fr_0.95fr]"
        >
          <section className="space-y-6">
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
              disabled={isGenerating}
              className="w-full rounded-md bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-auto"
            >
              {isGenerating ? "生成中..." : "Codex用プロンプトを生成"}
            </button>
          </section>

          <section className="flex min-h-[520px] flex-col">
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-bold text-ink">生成結果</h2>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!canCopy}
                className="rounded-md border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-line disabled:text-slate-400"
              >
                コピー
              </button>
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
            </div>
          </section>
        </form>

        <section className="rounded-md border border-line bg-white p-4 sm:p-6">
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
              className="rounded-md border border-line px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-mist"
            >
              更新
            </button>
          </div>

          {isLoadingHistory ? (
            <p className="rounded-md bg-mist p-4 text-sm text-slate-600">
              履歴を読み込んでいます。
            </p>
          ) : history.length === 0 ? (
            <p className="rounded-md bg-mist p-4 text-sm text-slate-600">
              まだ生成履歴はありません。
            </p>
          ) : (
            <div className="overflow-x-auto">
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
                      <td className="py-3 pr-4">
                        <button
                          type="button"
                          onClick={() => restoreHistory(project)}
                          className="font-semibold text-blue-700 underline-offset-4 hover:underline"
                        >
                          {project.appName}
                        </button>
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
                        <button
                          type="button"
                          onClick={() => void handleDelete(project.id)}
                          className="rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                        >
                          削除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
