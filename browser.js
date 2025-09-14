const japanese = (th) => {
  const content = th.querySelector("div");
  if (!content) return;

  const button = document.createElement("button");
  button.textContent = "ルビ";
  button.onclick = () => {
    document.body.classList.toggle("hide-ja-ruby");
    button.classList.toggle(
      "ja-ruby-hidden",
      document.body.classList.contains("hide-ja-ruby")
    );
  };
  const div = document.createElement("div");
  div.appendChild(button);
  content.appendChild(div);
};

const chinese = (th) => {
  const content = th.querySelector("div");
  if (!content) return;

  const button = document.createElement("button");
  button.textContent = "拼音";
  button.onclick = () => {
    document.body.classList.toggle("hide-zh-ruby");
    button.classList.toggle(
      "zh-ruby-hidden",
      document.body.classList.contains("hide-zh-ruby")
    );
  };
  const div = document.createElement("div");
  div.appendChild(button);
  content.appendChild(div);
};

document.addEventListener("DOMContentLoaded", () => {
  for (const th of document.querySelectorAll("thead tr.languages th[lang]")) {
    const lang = th.getAttribute("lang");

    if (lang === "ja") japanese(th);
    else if (lang === "zh") chinese(th);
  }
});
