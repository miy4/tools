#!/usr/bin/env -S deno run -A --ext ts
import { parseArgs } from "node:util";
import fs from "node:fs";
import { extract, toMarkdown } from "@mizchi/readability";

function normalizeForFilename(
  title: string,
  id: number,
  ext: string,
  maxBytes = 250,
): string {
  if (!Number.isSafeInteger(id) || id < 0) {
    throw new Error("id must be a non-negative safe integer");
  }

  if (!ext.startsWith(".")) {
    throw new Error("ext must start with '.'");
  }

  // Unicode正規化
  let name = title.normalize("NFKC");

  // 制御文字 + 禁止文字を置換
  name = name.replace(/[\u0000-\u001F\\\/:*?"<>|]/g, "_");

  // 連続するアンダースコアを整理
  name = name.replace(/_+/g, "_");

  // 先頭・末尾の空白とドットを削除
  name = name.replace(/^[\s.]+|[\s.]+$/g, "");

  // 空になった場合のフォールバック
  if (name.length === 0) {
    name = "untitled";
  }

  // NTFS予約名対策（タイトル部分のみ）
  const reserved = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;
  if (reserved.test(name)) {
    name = `${name}_`;
  }

  const separator = "-";
  const idPart = id.toString(36);
  const suffix = `${separator}${idPart}${ext}`;

  // バイト長制限（ID と拡張子は保持）
  const encoder = new TextEncoder();
  while (encoder.encode(name + suffix).length > maxBytes) {
    name = name.slice(0, -1);
  }

  // タイトルが完全に削れた場合
  if (name.length === 0) {
    name = "untitled";
  }

  return name + suffix;
}

function buildMarkdown(
  url: string,
  extracted: ReturnType<typeof extract>,
  date: Date,
): string {
  // YAML frontmatter
  const title = extracted.metadata?.title ?? "Untitled";
  let content =
    `---\nurl: ${url}\ntitle: ${title}\ndate_saved: ${date.toISOString()}\n---\n`;

  // Markdown
  const heading = extracted.metadata?.title;
  const markdown = toMarkdown(extracted.root);
  if (heading) {
    content += `# ${heading}\n\n`;
  }
  content += markdown;
  return content;
}

async function main() {
  const parsedArgs = parseArgs({
    args: Deno.args,
    allowPositionals: true,
    options: {
      "output-file": {
        type: "boolean",
        short: "o",
        default: false,
      },
    },
  });

  const url = parsedArgs.positionals[0];
  if (!url) {
    throw new Error("URL is required");
  }

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status}`);
  }

  const html = await res.text();
  const extracted = extract(html, { charThreshold: 100 });

  const dateSaved = new Date();
  const outputContent = buildMarkdown(url, extracted, dateSaved);

  // Output
  if (parsedArgs.values["output-file"]) {
    const title = extracted.metadata?.title ?? "Untitled";
    const path = normalizeForFilename(title, dateSaved.getTime(), ".md");
    fs.writeFileSync(path, outputContent);
    console.log(`Saved to: ${path}`);
  } else {
    console.log(outputContent);
  }
}

await main().catch(console.error);
