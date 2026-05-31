import assert from "node:assert/strict";
import test from "node:test";
import { toMarkdownList, toOptionalText } from "../lib/markdown";

test("toMarkdownList normalizes free-form lines into markdown bullets", () => {
  assert.equal(
    toMarkdownList("データ登録\n- 一覧表示\n* 検索"),
    "- データ登録\n- 一覧表示\n- 検索"
  );
});

test("toMarkdownList returns an explicit fallback when empty", () => {
  assert.equal(toMarkdownList("\n  \n"), "- 未入力");
});

test("toOptionalText trims input and falls back when blank", () => {
  assert.equal(toOptionalText("  注意点あり  ", "特になし"), "注意点あり");
  assert.equal(toOptionalText("   ", "特になし"), "特になし");
  assert.equal(toOptionalText(undefined, "特になし"), "特になし");
});
