import { readFileSync } from "fs";
import { join } from "path";

import { result } from "./emoji-test.js";
import { parse as parseJapanese } from "./jmdict.js";
import { originalToDiacritics } from "./arabic.js";
import { originalToPinyin } from "./chinese.js";

const languages = ["en", "fr", "es", "zh", "ja", "ar", "id"];

const emojis = result["Travel & Places"]["place-building"];

// console.log(emojis);

const emojiToLangToCell = {};
for (const lang of languages) {
  const full = JSON.parse(readFileSync(join(lang, "annotations.json"), "utf8"));

  for (const emoji of emojis) {
    const hit = full.annotations.annotations[emoji.emoji];
    if (!hit) continue;
    if (!(emoji.emoji in emojiToLangToCell))
      emojiToLangToCell[emoji.emoji] = {};

    const text = hit.tts.join("; ");
    emojiToLangToCell[emoji.emoji][lang] =
      lang === "ja"
        ? parseJapanese(text)
        : lang === "ar"
        ? originalToDiacritics[text] ?? text
        : lang === "zh"
        ? originalToPinyin[text] ?? text
        : text;
  }
}

// console.log(emojiToLangToCell);

const header = `| Emoji | ${languages.join(" | ")} |`;
console.log(header);
console.log("|---".repeat(languages.length + 1) + "|");

for (const emoji in emojiToLangToCell) {
  console.log(
    `| ${emoji} | ${Object.values(emojiToLangToCell[emoji]).join(" | ")} |`
  );
}

// console.log(
//   Object.values(emojiToLangToCell)
//     .map((o) => o.zh)
//     .join(" ")
// );
