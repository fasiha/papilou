const japanese = (th) => {
  const buttons = th.querySelector("div.buttons");
  if (!buttons) return;

  const button = document.createElement("button");
  button.textContent = "ルビ";
  button.onclick = () => {
    document.body.classList.toggle("hide-ja-ruby");
    button.classList.toggle(
      "ja-ruby-hidden",
      document.body.classList.contains("hide-ja-ruby")
    );
  };
  buttons.appendChild(button);
};

const chinese = (th) => {
  const buttons = th.querySelector("div.buttons");
  if (!buttons) return;

  const button = document.createElement("button");
  button.textContent = "拼音";
  button.onclick = () => {
    document.body.classList.toggle("hide-zh-ruby");
    button.classList.toggle(
      "zh-ruby-hidden",
      document.body.classList.contains("hide-zh-ruby")
    );
  };
  buttons.appendChild(button);
};

const addDeleteButton = (th, lang) => {
  const content = th.querySelector("div.buttons");
  if (!content) return;

  const button = document.createElement("button");
  button.textContent = "🚮";
  button.onclick = () => {
    document.body.classList.toggle(`hide-lang-${lang}`);
  };
  content.appendChild(button);
};

document.addEventListener("DOMContentLoaded", () => {
  // Dynamically generate and inject CSS for hiding language columns
  const style = document.createElement("style");
  const cssRules = [];

  document.querySelectorAll("thead tr.languages th[lang]").forEach((th) => {
    const lang = th.getAttribute("lang");
    cssRules.push(`body.hide-lang-${lang} [lang="${lang}"] { display: none; }`);
  });

  style.textContent = cssRules.join("\n");
  document.head.appendChild(style);

  // Add delete buttons to each language column header
  for (const th of document.querySelectorAll("thead tr.languages th[lang]")) {
    const lang = th.getAttribute("lang");

    if (lang === "ja") japanese(th);
    else if (lang === "zh") chinese(th);

    addDeleteButton(th, lang);
  }

  // Add reinstate button to the first column header
  const reinstateButton = document.createElement("button");
  reinstateButton.textContent = "↩️";
  reinstateButton.onclick = () => {
    document.body.classList.forEach((cls) => {
      if (cls.startsWith("hide-lang-")) {
        document.body.classList.remove(cls);
      }
    });
  };

  const firstColumnHeader = document.querySelector(
    "thead tr.languages th:first-child"
  );
  if (firstColumnHeader) {
    firstColumnHeader.appendChild(reinstateButton);
  }
});
