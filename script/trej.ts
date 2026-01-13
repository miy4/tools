#!/usr/bin/env -S deno run --allow-read --allow-write --allow-net --allow-env --ext ts
import { parseArgs } from "node:util";
import { generateText } from "npm:ai@6.0.20";
import { google } from "npm:@ai-sdk/google@3.0.6";

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
