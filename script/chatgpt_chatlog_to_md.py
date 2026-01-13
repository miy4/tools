#!/usr/bin/env python
import argparse
import json
import re
import sys
from datetime import datetime
from pathlib import Path

CITATION_NOISE_RE = re.compile(
    r"[\uE000-\uF8FF]+(?:cite|turn[0-9a-zA-Z]+|turn\dsearch\d{1,2})?",
)


def clean_citation_noise(text: str) -> str:
    return CITATION_NOISE_RE.sub("", text)


def unix_to_local_date(ts: float) -> str:
    dt = datetime.fromtimestamp(ts)
    return dt.strftime("%Y-%m-%d")


def unix_to_local_datetime(ts: float) -> str:
    dt = datetime.fromtimestamp(ts)
    return dt.strftime("%Y-%m-%d %H:%M:%S")


def extract_text(message: dict) -> str:
    if not message:
        return ""

    content = message.get("content", {})
    if content.get("content_type") != "text":
        return ""

    raw = "".join(content.get("parts", []))
    return clean_citation_noise(raw).strip()


def restore_visible_path(conversation: dict) -> list[dict]:
    mapping = conversation.get("mapping", {})
    node_id = conversation.get("current_node")

    nodes = []
    while node_id and node_id in mapping:
        node = mapping[node_id]
        if node.get("message"):
            nodes.append(node)
        node_id = node.get("parent")

    return list(reversed(nodes))


def first_valid_create_time(messages: list[dict]) -> float | None:
    for node in messages:
        ct = node["message"].get("create_time")
        if ct is not None:
            return ct
    return None


def load_conversations(path: Path) -> list[dict]:
    try:
        with path.open(encoding="utf-8") as f:
            data = json.load(f)
    except FileNotFoundError as e:
        raise FileNotFoundError(f"input file not found: {path}") from e
    except json.JSONDecodeError as e:
        raise ValueError(f"invalid JSON format in {path}: {e}") from e
    except OSError as e:
        raise OSError(f"failed to read input file {path}: {e}") from e

    if isinstance(data, dict):
        return data.get("conversations", [])
    if isinstance(data, list):
        return data

    return []


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Convert ChatGPT exported conversations to daily Markdown files",
    )
    parser.add_argument(
        "-i",
        "--input-json",
        default="conversations.json",
        help="Path to input JSON file (default: conversations.json)",
    )
    parser.add_argument(
        "-o",
        "--output-dir",
        default="output_md",
        help="Output directory for Markdown files (default: output_md)",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    input_json = Path(args.input_json)
    output_dir = Path(args.output_dir)

    try:
        conversations = load_conversations(input_json)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

    daily_md: dict[str, list[str]] = {}

    for conv in conversations:
        title = conv.get("title") or "Untitled"
        messages = restore_visible_path(conv)

        if not messages:
            continue

        first_time = first_valid_create_time(messages)
        if first_time is None:
            continue

        date_key = unix_to_local_date(first_time)

        md_lines = []
        md_lines.append(f"## {title}\n")

        for node in messages:
            msg = node["message"]
            role = msg.get("author", {}).get("role", "unknown")
            text = extract_text(msg)
            ct = msg.get("create_time")

            if not text:
                continue

            md_lines.append(f"**{role.capitalize()}**  ")

            if ct is not None:
                md_lines.append(f"*{unix_to_local_datetime(ct)}*  ")

            md_lines.append(text)
            md_lines.append("")

        daily_md.setdefault(date_key, []).extend(md_lines)

    try:
        output_dir.mkdir(exist_ok=True)
    except OSError as e:
        print(
            f"Error: failed to create output directory {output_dir}: {e}",
            file=sys.stderr,
        )
        sys.exit(1)

    for date, lines in daily_md.items():
        md_path = output_dir / f"{date}.md"
        try:
            with md_path.open("w", encoding="utf-8") as f:
                f.write(f"# {date}\n\n")
                f.write("\n".join(lines))
        except OSError as e:
            print(f"Error: failed to write file {md_path}: {e}", file=sys.stderr)
            sys.exit(1)

        print(f"written: {md_path}")


if __name__ == "__main__":
    main()
