"""原稿（source.txt）を台本（script.json）に変える。

原稿の書き方は source.txt の先頭のコメントのとおり。台本の文は原稿のまま使い、
  - 「、」で終わる行・句点の無い行は、次の行とつなぐ（強調のための改行なので）
  - 「…」で終わる行のあとが「と／という／を／に」で始まるなら、つなぐ
  - そのあと「。」「？」で文に分ける（「」の中では分けない）
読みにくい数字や英字は READINGS で読み（read）を付ける（画面と字幕は元の表記のまま）。

  .venv/bin/python tools/parse_source.py kangaeru-01
"""
from __future__ import annotations

import argparse
import json
import re

from common import ROOT

# 表記 → 読み（声だけに使う）
READINGS = {
    "ハンター・S・トンプソン": "ハンター・エス・トンプソン",
    "1970年": "せんきゅうひゃくななじゅうねん",
    "1990年代": "せんきゅうひゃくきゅうじゅうねんだい",
    "100万回": "ひゃくまんかい",
    "YouTuber": "ユーチューバー",
    "SNS": "エスエヌエス",
    "IT": "アイティー",
    "OS": "オーエス",
    "選択肢A": "選択肢エー",
    "選択肢B": "選択肢ビー",
    "二十歳": "はたち",
    "十一年目": "じゅういちねんめ",
    "二十年": "にじゅうねん",
}

TERMINAL = ("。", "？", "！", "」", "』")
CONT_START = ("と", "を", "に", "という", "として")


def split_sentences(text: str) -> list[str]:
    """「。」「？」で分ける（かぎかっこの中は分けない）。"""
    out, buf, depth = [], "", 0
    for ch in text:
        buf += ch
        if ch in "「『":
            depth += 1
        elif ch in "」』":
            depth = max(0, depth - 1)
        elif ch in "。？！" and depth == 0:
            out.append(buf.strip())
            buf = ""
    if buf.strip():
        out.append(buf.strip())
    return out


def join_lines(lines: list[str]) -> list[str]:
    """強調のための改行をつなぐ。"""
    units: list[str] = []
    cur = ""
    for i, ln in enumerate(lines):
        cur += ln
        nxt = lines[i + 1] if i + 1 < len(lines) else ""
        cont = (not ln.endswith(TERMINAL)) or (ln.endswith(("」", "』")) and nxt.startswith(CONT_START))
        if cont and nxt:
            continue
        units.append(cur)
        cur = ""
    if cur:
        units.append(cur)
    return units


def reading(text: str) -> str | None:
    r = text
    for k in sorted(READINGS, key=len, reverse=True):
        r = r.replace(k, READINGS[k])
    return r if r != text else None


def parse(src: str, ep: str) -> dict:
    parts, scenes, sentences = [], [], []
    block = None
    raw_lines: list[str] = []
    part = None

    def flush():
        nonlocal raw_lines
        if block is None:
            raw_lines = []
            return
        ids = []
        for unit_i, unit in enumerate(join_lines(raw_lines)):
            for s in split_sentences(unit):
                sid = f"s{len(sentences)}"
                item = {"id": sid, "text": s, "part": part["id"]}
                r = reading(s)
                if r:
                    item["read"] = r
                # 言葉の場面で見せる短い形: 「周囲からは、真面目。」→「真面目」のように、
                # 読点の前が短い前置き（6字以下）のときだけ
                head, _, last = s.rstrip("。").rpartition("、")
                if head and len(head) <= 6:
                    item["short"] = last
                sentences.append(item)
                ids.append(sid)
        block["sentences"] = ids
        if ids:
            scenes.append(block)
        raw_lines = []

    for ln in src.splitlines():
        line = ln.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("="):
            flush()
            block = None
            pid, label, title = [x.strip() for x in line[1:].split("|")]
            part = {"id": pid, "label": label, "title": title}
            parts.append(part)
            scenes.append({"id": f"{pid}-card", "type": "chapter", "part": pid, "sentences": [],
                           "items": {"label": label, "title": title}, "hold": 4.0})
            continue
        if line.startswith("@"):
            flush()
            fields = [x.strip() for x in line[1:].split("|")]
            items = {}
            for f in fields[1:]:
                k, _, v = f.partition("=")
                items[k.strip()] = v.strip().replace("\\n", "\n")
            block = {"id": f"{part['id']}-{len([s for s in scenes if s['part'] == part['id']])}", "type": fields[0],
                     "part": part["id"], "items": items}
            if "clip" in items:
                block["clip"] = items["clip"]
            continue
        raw_lines.append(line)
    flush()
    return {"parts": parts, "scenes": scenes, "sentences": sentences}


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("episode")
    args = ap.parse_args()
    d = ROOT / "episodes" / args.episode
    src = (d / "source.txt").read_text(encoding="utf-8")
    parsed = parse(src, args.episode)
    head_path = d / "head.json"
    head = json.loads(head_path.read_text(encoding="utf-8"))
    script = {**head, **parsed}
    (d / "script.json").write_text(json.dumps(script, ensure_ascii=False, indent=1), encoding="utf-8")
    chars = sum(len(s["text"]) for s in parsed["sentences"])
    print(f"parts {len(parsed['parts'])}  scenes {len(parsed['scenes'])}  sentences {len(parsed['sentences'])}  chars {chars}")
    for p in parsed["parts"]:
        ss = [s for s in parsed["sentences"] if s["part"] == p["id"]]
        print(f"  {p['id']:9s} {len(ss):4d}文 {sum(len(s['text']) for s in ss):5d}字  {p['title']}")


if __name__ == "__main__":
    main()
