import { readFileSync } from "fs";
import { join } from "path";

import { result } from "./emoji-test.js";
import { parse as parseJapanese } from "./jmdict.js";
import { originalToDiacritics } from "./arabic.js";
import { originalToPinyin } from "./chinese.js";

const CLDR = process.env.CLDR || "cldr-47";

const languages = ["en", "fr", "es", "zh", "ja", "ar", "id"];
const languageToDatabase = Object.fromEntries(
  languages.map((lang) => [
    lang,
    JSON.parse(
      readFileSync(
        join(
          CLDR,
          "cldr-annotations-full",
          "annotations",
          lang,
          "annotations.json"
        ),
        "utf8"
      )
    ),
  ])
);

function printObject(obj) {
  const header = `| Emoji | ${languages.join(" | ")} |`;
  console.log(header);
  console.log("|---".repeat(languages.length + 1) + "|");

  for (const emoji in obj) {
    console.log(`| ${emoji} | ${Object.values(obj[emoji]).join(" | ")} |`);
  }
}

function emojisToTable(emojis) {
  const emojiToLangToCell = {};
  for (const lang of languages) {
    const full = languageToDatabase[lang];

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
  return emojiToLangToCell;
}

// const emojis = result["Travel & Places"]["place-building"];
// printObject(emojisToTable(emojis));

for (const category in result) {
  console.log(`## ${category}`);
  for (const subcategory in result[category]) {
    console.log(`### ${category} / ${subcategory}`);
    printObject(emojisToTable(result[category][subcategory]));
  }
}
