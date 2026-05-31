import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const metadataBase = new URL(siteUrl);
const title =
  "Codex開発プランナー｜アプリ案をCodex用プロンプトに変換するAI開発補助ツール";
const description =
  "Codex開発プランナーは、作りたいアプリのアイデアを整理し、Codexアプリに貼り付けられる開発プロンプトを生成するAI開発補助ツールです。";

export const metadata: Metadata = {
  metadataBase,
  title,
  description,
  keywords: [
    "Codex",
    "Codex アプリ",
    "Codex 開発",
    "Codex プロンプト",
    "AI開発補助",
    "アプリ開発 初心者",
    "プロンプト生成",
    "要件整理",
    "個人開発",
    "AIコーディング"
  ],
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title,
    description,
    url: "/",
    siteName: "Codex開発プランナー",
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Codex開発プランナー"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-image.png"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  icons: {
    icon: [
      {
        url: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        url: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png"
      }
    ],
    apple: "/icons/icon-192.png"
  },
  manifest: "/manifest.json"
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
