import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

import { result as CATEGORY_SUBCAT_EMOJI } from "./emoji-test.js";
import { parse as parseJapanese } from "./jmdict.js";
import { originalToDiacritics } from "./arabic.js";
import { originalToPinyin } from "./chinese.js";

const languages = ["en", "fr", "es", "zh", "ja", "ar", "id", "fil"];
const LANG_TO_NAME = {
  en: "English",
  fr: "Français",
  es: "Español",
  zh: "中文",
  ja: "日本語",
  ar: "العربية",
  id: "Bahasa Indonesia",
  fil: "Filipino",
};
const CLDR = process.env.CLDR || "cldr-47";

if (
  Object.keys(LANG_TO_NAME).length !== languages.length ||
  !languages.every((l) => l in LANG_TO_NAME)
) {
  throw new Error("LANG_TO_NAME is missing some languages");
}

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

function objToString(obj) {
  const lines = [`| Emoji | ${languages.join(" | ")} |`];
  lines.push("|---".repeat(languages.length + 1) + "|");

  for (const emoji in obj) {
    lines.push(`| ${emoji} | ${Object.values(obj[emoji]).join(" | ")} |`);
  }

  return lines.join("\n");
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

function isEmptyObj(obj) {
  for (const _ in obj) {
    return false;
  }
  return true;
}

function makeMarkdown() {
  const lines = [];
  for (const category in CATEGORY_SUBCAT_EMOJI) {
    lines.push(`## ${category}`);
    for (const subcategory in CATEGORY_SUBCAT_EMOJI[category]) {
      const table = emojisToTable(CATEGORY_SUBCAT_EMOJI[category][subcategory]);
      if (isEmptyObj(table)) continue;
      lines.push(`### ${category} / ${subcategory}`);
      lines.push(objToString(table));
    }
  }
  lines.push("\n");
  return lines.join("\n");
}

function makeHtml() {
  const lines = [];
  lines.push(`<html><head><meta charset="utf-8"><title>Papilou</title>`);
  lines.push('<link rel="stylesheet" href="./papilou.css">');
  lines.push(
    `<meta name="viewport" content="width=device-width, initial-scale=1"/>`
  );
  lines.push(`</head><body>`);
  lines.push(`<table>`);

  const makeHeaderRow = (cells) =>
    `<tr class="languages">${cells.join("")}</tr>`;
  const makeSingleRow = (content) =>
    `<tr class="category"><th colspan="${
      languages.length + 1
    }">${content}</th></tr>`;

  lines.push("<thead>");
  lines.push(
    makeHeaderRow([
      "<th></th>",
      ...languages.map(
        (l) => `<th lang="${l}"><div>${LANG_TO_NAME[l]}</div></th>`
      ),
    ])
  );

  lines.push("</thead>");
  for (const category in CATEGORY_SUBCAT_EMOJI) {
    for (const subcategory in CATEGORY_SUBCAT_EMOJI[category]) {
      const table = emojisToTable(CATEGORY_SUBCAT_EMOJI[category][subcategory]);
      if (isEmptyObj(table)) continue;
      lines.push(makeSingleRow(`${category} / ${subcategory}`));

      for (const emoji in table) {
        const cells = [
          `<td>${emoji}</td>`,
          ...languages.map(
            (lang) => `<td lang="${lang}">${table[emoji][lang] || ""}</td>`
          ),
        ];
        const row = cells.join("");
        lines.push(`<tr>${row}</tr>`);
      }
    }
  }
  lines.push(`</table>`);
  lines.push(`<script src="./browser.js" defer></script>`);
  lines.push(`</body></html>`);
  return lines.join("\n");
}

writeFileSync("papilou.md", makeMarkdown(), "utf8");
writeFileSync("index.html", makeHtml(), "utf8");
