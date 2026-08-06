const TEXTS = [
  "O sol nasceu cedo sobre a aldeia e os pássaros começaram a cantar nos telhados de telha vermelha.",
  "Aprender a programar exige paciência, prática diária e vontade de errar muitas vezes até acertar.",
  "A biblioteca da cidade tem milhares de livros antigos guardados em prateleiras altas de madeira escura.",
  "Depois da chuva, o cheiro a terra molhada espalhou-se por toda a floresta e pelos campos vizinhos.",
  "Um bom jogo é simples de aprender, difícil de dominar e sempre convida a mais uma tentativa.",
  "A equipa treinou toda a semana debaixo de sol forte para estar pronta para o jogo de sábado.",
  "Viajar sozinho ensina a resolver problemas com calma e a confiar nas próprias decisões.",
  "O café da manhã na aldeia incluía pão quente, queijo fresco e um copo grande de leite."
];

let target, startTime, finished, best;

function loadBest() {
  best = Number(localStorage.getItem("jogazone-digitacao-best") || 0);
  document.getElementById("best").textContent = best;
}

function newText() {
  target = TEXTS[Math.floor(Math.random() * TEXTS.length)];
  startTime = null;
  finished = false;
  document.getElementById("type-input").value = "";
  document.getElementById("type-input").disabled = false;
  document.getElementById("wpm").textContent = 0;
  document.getElementById("accuracy").textContent = 100;
  renderTarget("");
  document.getElementById("type-input").focus();
}

function renderTarget(typed) {
  const el = document.getElementById("target-text");
  el.innerHTML = target
    .split("")
    .map((ch, i) => {
      if (i >= typed.length) return `<span class="pending">${ch}</span>`;
      return typed[i] === ch ? `<span class="correct">${ch}</span>` : `<span class="wrong">${ch}</span>`;
    })
    .join("");
}

document.getElementById("type-input").addEventListener("input", (e) => {
  if (finished) return;
  const typed = e.target.value;
  if (!startTime) startTime = performance.now();
  renderTarget(typed);

  let correctCount = 0;
  for (let i = 0; i < typed.length; i++) if (typed[i] === target[i]) correctCount++;
  const accuracy = typed.length ? Math.round((correctCount / typed.length) * 100) : 100;
  document.getElementById("accuracy").textContent = accuracy;

  const minutes = (performance.now() - startTime) / 60000;
  const words = typed.trim().split(/\s+/).filter(Boolean).length;
  const wpm = minutes > 0 ? Math.round(words / minutes) : 0;
  document.getElementById("wpm").textContent = wpm;

  if (typed === target) {
    finished = true;
    document.getElementById("type-input").disabled = true;
    if (wpm > best) {
      best = wpm;
      localStorage.setItem("jogazone-digitacao-best", String(best));
      document.getElementById("best").textContent = best;
    }
    setTimeout(() => alert(`Concluído! ${wpm} palavras por minuto, ${accuracy}% de precisão.`), 100);
  }
});

document.getElementById("restart-btn").addEventListener("click", newText);
loadBest();
newText();
