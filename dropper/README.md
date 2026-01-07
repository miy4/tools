# Dropper

Dropper is a small CLI tool that fetches a web page, extracts the main article
content, and converts it into clean Markdown.\
It is designed for saving readable versions of articles for note-taking systems,
knowledge bases, or offline reading.

## Requirements

- [Deno](https://deno.com/) v1.40 or later

## Installation

Clone the repository:

```sh
$ git clone https://github.com/miy4/tools.git
$ cd tools/dropper
```

### Optional: Build a standalone binary

You can compile Dropper into a single executable:

```sh
$ deno task build
```

This will generate a binary named `dropper` in the project directory.

## Usage

### Run with Deno

```sh
$ deno run -A main.ts <URL>
```

This prints the generated Markdown to standard output.

### Save to a Markdown file

```sh
$ deno run -A main.ts -o <URL>
```

- The file name is derived from the article title
- Unsafe characters are removed
- Length limits and reserved filenames are handled automatically

### Run the compiled binary

After building:

```sh
$ ./dropper <URL>
$ ./dropper -o <URL>
```

## Notes

- This tool works best on article-style pages (blogs, documentation, news).
- Pages with heavy client-side rendering may not extract cleanly.
- The filename normalization logic is designed to be safe across platforms
  (macOS, Linux, Windows).

## License

MIT
