import { readFileSync } from "fs";
import { join } from "path";

const full = JSON.parse(
  readFileSync(join("JmdictFurigana.json"), "utf8").trim()
);

const textToReading = {};
const textToFurigana = {};

for (const entry of full) {
  if (!(entry.text in textToReading)) {
    textToReading[entry.text] = entry.reading;
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
      // No dictionary match: keep the character as-is
      segments.push({ original: sentence[i], reading: null });
      i++;
    }
  }

  return segments;
}

// console.log(tokenize("日本語を学校で学ぶ", textToReading));
// console.dir(tokenize("日本語を学校で学ぶ", textToFurigana), { depth: null });

const makeRuby = ({ ruby, rt }) =>
  rt ? `<ruby>${ruby}<rt>${rt}</rt></ruby>` : ruby;

export const parse = (sentence) => {
  const tokens = tokenize(sentence, textToFurigana);
  return tokens
    .map((token) => token.reading?.map(makeRuby).join("") ?? token.original)
    .join("");
};
