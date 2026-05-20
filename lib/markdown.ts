export function toMarkdownList(text: string): string {
  const items = text
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (items.length === 0) {
    return "- 未入力";
  }

  return items
    .map((item) => {
      const normalized = item.replace(/^[-*]\s*/, "");
      return `- ${normalized}`;
    })
    .join("\n");
}

export function toOptionalText(text: string | undefined, fallback: string): string {
  const trimmed = text?.trim();
  return trimmed ? trimmed : fallback;
}
