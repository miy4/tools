# trej

`trej` is a simple command-line translation tool built with Deno and the Gemini
API.\
It automatically detects whether the input text is Japanese or English and
translates it into the other language while preserving meaning, tone, and
nuance.

## Prerequisites

- [Deno](https://deno.com/) v1.40 or later
- A Gemini API key

You must set your Gemini API key in the following environment variable:

```sh
% export GOOGLE_GENERATIVE_AI_API_KEY="your_api_key_here"
```

## Installation

Clone the repository and move into the project directory:

```sh
% git clone https://github.com/miy4/tools.git
% cd tools/trej
```

### (Optional) Build a standalone binary:

```sh
% deno task build
```

This will generate an executable named `trej` in the project directory.

## Usage

### Run with Deno (without compiling)

Translate text by passing it as an argument:

```sh
% deno run -A main.ts "こんにちは、元気ですか？"
```

Translate text via standard input:

```sh
% echo "How are you?" | deno run -A main.ts
```

### Run the compiled binary

After building, you can use the `trej` binary directly.

Translate using a command-line argument:

```sh
% ./trej "今日はいい天気ですね。"
% echo "This project is written in Deno." | ./trej
```

## Notes

- Network access is required to communicate with the Gemini API.
- The translation model used is `gemini-3-flash-preview`.

## License

MIT
