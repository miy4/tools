#!/usr/bin/env -S deno run -A --ext ts
import { parseArgs } from "node:util";
import { generateText } from "npm:ai";
import { google } from "npm:@ai-sdk/google";

async function main() {
  const arg = parseArgs({
    args: Deno.args,
    allowPositionals: true,
    options: {},
  });

  const input = arg.positionals[0] ??
    await new Response(Deno.stdin.readable).text();
  if (!input) {
    throw new Error("No input provided");
  }

  const { text } = await generateText({
    model: google("gemini-3-flash-preview"),
    system:
      `You are a language model that translates between Japanese and English. Automatically detect the input language:
- Japanese → English
- English → Japanese

Preserve the original meaning, tone, style, and nuance. Match formality and politeness. Translate idioms, proverbs, and culturally specific expressions into natural equivalents, adding brief explanations only when needed. Choose context-appropriate phrasing and technical terms. Produce fluent, natural translations and avoid overly literal wording.`,
    prompt: `Translate the following text:\n\n${input}`,
  });
  console.log(text);
}

await main().catch(console.error);
