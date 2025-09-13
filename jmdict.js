import { readFileSync } from "fs";
import { join } from "path";

const REQUIRE_ALL_FURIGANA = !!process.env.REQUIRE_ALL_FURIGANA || false;
const KANJI_REGEXP =
  /[\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u3005\u3007\u3021-\u3029\u3038-\u303B\u3400-\u4DB5\u4E00-\u9FEF\uF900-\uFA6D\uFA70-\uFAD9]/;

const full = JSON.parse(
  readFileSync(join("JmdictFurigana.json"), "utf8").trim()
);
function hasKanji(s) {
  return KANJI_REGEXP.test(s);
}
const CUSTOM = {
  聞: "き",
  開: "あ",
  閉: "と",
  溶: "と",
  誇: "ほ",
  怒: "お",
  泣: "な",
  咬: "か",
  浮: "う",
  焚: "や",
  壊: "こ",
  営: "えい",
};

const textToFurigana = {};

for (const entry of full) {
  if (!(entry.text in textToFurigana)) {
    textToFurigana[entry.text] = entry.furigana;
  } else {
    // duplicate text with different readings
  }
}

function tokenize(sentence, dict) {
  const segments = [];
  let i = 0;

  while (i < sentence.length) {
    let match = null;
    let matchLength = 0;

    // Greedy search for the longest substring starting at i
    for (let j = sentence.length; j > i; j--) {
      const substr = sentence.slice(i, j);
      if (dict[substr]) {
        match = dict[substr];
        matchLength = j - i;
        break;
      }
    }

    if (match) {
      segments.push({
        original: sentence.slice(i, i + matchLength),
        reading: match,
      });
      i += matchLength;
    } else {
      // No dictionary match
      const char = sentence[i];
      if (char in CUSTOM) {
        segments.push({
          original: char,
          reading: [{ ruby: char, rt: CUSTOM[char] }],
        });
      } else {
        if (REQUIRE_ALL_FURIGANA && hasKanji(char)) {
          throw new Error(`No furigana found for character: ${char}`);
        }
        segments.push({ original: char, reading: null });
      }
      i++;
    }
  }

  return segments;
}

const makeRuby = ({ ruby, rt }) =>
  rt ? `<ruby>${ruby}<rt>${rt}</rt></ruby>` : ruby;

export const parse = (sentence) => {
  const tokens = tokenize(sentence, textToFurigana);
  return tokens
    .map((token) => token.reading?.map(makeRuby).join("") ?? token.original)
    .join("");
};
