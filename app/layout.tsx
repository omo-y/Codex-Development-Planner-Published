import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Codex開発プランナー",
  description:
    "作りたいアプリの要件を整理し、Codex用の開発プロンプトを生成するWebアプリです。"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
