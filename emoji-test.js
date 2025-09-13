import { readFileSync } from "fs";
import { join } from "path";

// adjust path to your emoji-test.txt file
const filePath = join("emoji-test.txt");
const text = readFileSync(filePath, "utf8");

const lines = text.split("\n");

const SKIN_TONE_MODIFIERS = new Set([
  "1F3FB",
  "1F3FC",
  "1F3FD",
  "1F3FE",
  "1F3FF",
]);

function isSkinToneSequence(codepoints) {
  return codepoints.some((cp) => SKIN_TONE_MODIFIERS.has(cp));
}

export const result = {};
let currentGroup = null;
let currentSubgroup = null;

for (const line of lines) {
  if (line.startsWith("# group:")) {
    currentGroup = line.replace("# group:", "").trim();
    if (!result[currentGroup]) result[currentGroup] = {};
  } else if (line.startsWith("# subgroup:")) {
    currentSubgroup = line.replace("# subgroup:", "").trim();
    if (!result[currentGroup][currentSubgroup]) {
      result[currentGroup][currentSubgroup] = [];
    }
  } else if (
    line.includes("; fully-qualified") ||
    line.includes("; minimally-qualified") ||
    line.includes("; unqualified")
  ) {
    const [codesPart, rest] = line.split(";");
    const codepoints = codesPart.trim().split(/\s+/);

    if (isSkinToneSequence(codepoints)) continue;

    const afterHash = rest.split("#")[1]?.trim();
    if (!afterHash) continue;

    const [emoji, version, ...nameParts] = afterHash.split(/\s+/);
    const name = nameParts.join(" ");

    result[currentGroup][currentSubgroup].push({
      codepoints: codepoints.join(" "),
      emoji,
      version, // e.g. "E0.6"
      name,
    });
  }
}
