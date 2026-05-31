import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

test("PWA manifest contains required app metadata and icons", () => {
  const manifest = JSON.parse(
    readFileSync("public/manifest.json", "utf8")
  ) as {
    name?: string;
    short_name?: string;
    start_url?: string;
    display?: string;
    icons?: Array<{ src?: string; sizes?: string; type?: string }>;
  };

  assert.equal(manifest.name, "Codex開発プランナー");
  assert.equal(manifest.short_name, "開発プランナー");
  assert.equal(manifest.start_url, "/");
  assert.equal(manifest.display, "standalone");
  assert.deepEqual(manifest.icons, [
    {
      src: "/icons/icon-192.png",
      sizes: "192x192",
      type: "image/png"
    },
    {
      src: "/icons/icon-512.png",
      sizes: "512x512",
      type: "image/png"
    }
  ]);
});

test("release image assets exist", () => {
  assert.equal(existsSync("public/og-image.png"), true);
  assert.equal(existsSync("public/icons/icon-192.png"), true);
  assert.equal(existsSync("public/icons/icon-512.png"), true);
});

test("privacy and terms pages exist for release", () => {
  assert.equal(existsSync("app/privacy/page.tsx"), true);
  assert.equal(existsSync("app/terms/page.tsx"), true);
});

test("example environment file documents required Vercel variables only with placeholders", () => {
  const envExample = readFileSync(".env.local.example", "utf8");

  for (const key of [
    "DATABASE_URL",
    "DIRECT_URL",
    "NEXT_PUBLIC_SITE_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY"
  ]) {
    assert.match(envExample, new RegExp(`^${key}=`, "m"));
  }

  assert.doesNotMatch(envExample, /eyJ[A-Za-z0-9_-]+\./);
  assert.doesNotMatch(envExample, /service_role_[A-Za-z0-9_-]+/);
});
