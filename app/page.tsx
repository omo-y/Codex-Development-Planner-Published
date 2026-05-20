"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  AI_OPTIONS,
  APP_TYPES,
  DEVELOPMENT_STACKS,
  STORAGE_OPTIONS
} from "@/lib/templates";
import type { ProjectPlanInput, ProjectPlanResponse } from "@/types/project";

const initialForm: ProjectPlanInput = {
  appName: "",
  appIdea: "",
  targetUser: "",
  appType: "Webアプリ",
  developmentStack: "Next.js + TypeScript + Tailwind CSS",
  aiOption: "AIなし",
  storageOption: "SQLite + Prisma",
  features: "",
  screens: "",
  extraNotes: ""
};

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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export default function Home() {
  const [form, setForm] = useState<ProjectPlanInput>(initialForm);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [history, setHistory] = useState<ProjectPlanResponse[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const canCopy = useMemo(
    () => generatedPrompt.trim().length > 0,
    [generatedPrompt]
  );

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
    setGeneratedPrompt(project.generatedPrompt);
    setErrorMessage("");
    setSuccessMessage("履歴から入力内容を復元しました。");
  }

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsGenerating(true);

    try {
      const promptResponse = await fetch("/api/prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
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

      const saveResponse = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...form,
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
          <section className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-ink">
                アプリ名
              </span>
              <input
                value={form.appName}
                onChange={(event) => updateForm("appName", event.target.value)}
                placeholder="例：シンプル家計簿"
                className="w-full rounded-md border border-line bg-white px-3 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-ink">
                作りたいアプリの概要
              </span>
              <textarea
                value={form.appIdea}
                onChange={(event) => updateForm("appIdea", event.target.value)}
                placeholder="例：毎日の支出を記録し、月ごとの支出合計やカテゴリ別の支出を確認できる家計簿アプリを作りたい。"
                rows={5}
                className="w-full resize-y rounded-md border border-line bg-white px-3 py-3 text-sm leading-6 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-ink">
                対象ユーザー
              </span>
              <input
                value={form.targetUser}
                onChange={(event) =>
                  updateForm("targetUser", event.target.value)
                }
                placeholder="例：個人、学生、会社員、家庭で家計管理をしたい人"
                className="w-full rounded-md border border-line bg-white px-3 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
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

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-ink">
                必要機能
              </span>
              <textarea
                value={form.features}
                onChange={(event) => updateForm("features", event.target.value)}
                placeholder={"- データ登録\n- 一覧表示\n- 編集\n- 削除\n- 検索\n- グラフ表示\n- 履歴保存\n- Markdownコピー"}
                rows={6}
                className="w-full resize-y rounded-md border border-line bg-white px-3 py-3 text-sm leading-6 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-ink">
                画面構成
              </span>
              <textarea
                value={form.screens}
                onChange={(event) => updateForm("screens", event.target.value)}
                placeholder={"- ダッシュボード\n- 入力画面\n- 一覧画面\n- 詳細画面\n- 設定画面"}
                rows={5}
                className="w-full resize-y rounded-md border border-line bg-white px-3 py-3 text-sm leading-6 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-ink">
                追加したい注意点
              </span>
              <textarea
                value={form.extraNotes}
                onChange={(event) =>
                  updateForm("extraNotes", event.target.value)
                }
                placeholder="初心者でも分かりやすいコードにしてください。READMEに起動手順を書いてください。TypeScriptエラーが出ないようにしてください。"
                rows={4}
                className="w-full resize-y rounded-md border border-line bg-white px-3 py-3 text-sm leading-6 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

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
