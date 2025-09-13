import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

import { result } from "./emoji-test.js";

const arabic = JSON.parse(readFileSync(join("ar", "annotations.json"), "utf8"));
const chinese = JSON.parse(
  readFileSync(join("zh", "annotations.json"), "utf8")
);

const emojis = Object.values(result).flatMap((group) =>
  Object.values(group).flat()
);

const arabicOut = [];
for (const emoji of emojis) {
  const hit = arabic.annotations.annotations[emoji.emoji];
  if (!hit) continue;
  const text = hit.tts.join("; ");
  arabicOut.push(text);
}
writeFileSync("arabic.txt", arabicOut.join("\n"), "utf8");

const chineseOut = [];
for (const emoji of emojis) {
  const hit = chinese.annotations.annotations[emoji.emoji];
  if (!hit) continue;
  const text = hit.tts.join("; ");
  chineseOut.push(text);
}

writeFileSync("chinese.txt", chineseOut.join("\n"), "utf8");
