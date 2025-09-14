/**
 * Chinese pinyin via `parsechinese.py`
 */

import assert from "assert";
import { readFileSync } from "fs";
import { join } from "path";

const original = readFileSync(join("chinese.txt"), "utf8").trim().split("\n");
const pinyin = readFileSync(join("chinese-pinyin.txt"), "utf8")
  .trim()
  .split("\n");
assert(original.length === pinyin.length);

export const originalToPinyin = Object.fromEntries(
  original.map((text, i) => [
    text,
    pinyin[i].replace(/(\s+)/g, '<span class="whitespace">$1</span>'),
  ])
);
