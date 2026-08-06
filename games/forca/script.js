const WORD_LIST = [
  { word: "GUITARRA", category: "Música" },
  { word: "COMPUTADOR", category: "Tecnologia" },
  { word: "MONTANHA", category: "Natureza" },
  { word: "FUTEBOL", category: "Desporto" },
  { word: "BIBLIOTECA", category: "Lugares" },
  { word: "ELEFANTE", category: "Animais" },
  { word: "CHOCOLATE", category: "Comida" },
  { word: "FOGUETE", category: "Ciência" },
  { word: "JARDIM", category: "Natureza" },
  { word: "PINTURA", category: "Arte" },
  { word: "OCEANO", category: "Natureza" },
  { word: "VIOLINO", category: "Música" },
  { word: "CASTELO", category: "Lugares" },
  { word: "BICICLETA", category: "Transporte" },
  { word: "TESOURO", category: "Aventura" }
];

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const MAX_ERRORS = 6;

let current, guessed, errors, wins;

function loadWins() {
  wins = Number(localStorage.getItem("jogazone-forca-wins") || 0);
  document.getElementById("wins").textContent = wins;
}

function pickWord() {
  return WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
}

function reset() {
  current = pickWord();
  guessed = new Set();
  errors = 0;
  document.getElementById("category").textContent = current.category;
  document.getElementById("errors").textContent = errors;
  renderWord();
  renderKeyboard();
  drawHangman();
}

function renderWord() {
  const wordEl = document.getElementById("word");
  wordEl.innerHTML = current.word
    .split("")
    .map((letter) => `<span class="letter-slot">${guessed.has(letter) ? letter : ""}</span>`)
    .join("");
}

function renderKeyboard() {
  const kb = document.getElementById("keyboard");
  kb.innerHTML = "";
  ALPHABET.forEach((letter) => {
    const btn = document.createElement("button");
    btn.className = "forca-key";
    btn.textContent = letter;
    btn.addEventListener("click", () => onGuess(letter, btn));
    kb.appendChild(btn);
  });
}

function onGuess(letter, btn) {
  if (guessed.has(letter)) return;
  guessed.add(letter);
  btn.disabled = true;

  if (current.word.includes(letter)) {
    btn.classList.add("correct");
  } else {
    btn.classList.add("wrong");
    errors++;
    document.getElementById("errors").textContent = errors;
    drawHangman();
  }

  renderWord();

  const solved = current.word.split("").every((l) => guessed.has(l));
  if (solved) {
    wins++;
    localStorage.setItem("jogazone-forca-wins", String(wins));
    document.getElementById("wins").textContent = wins;
    setTimeout(() => alert("Acertaste! A palavra era " + current.word), 100);
  } else if (errors >= MAX_ERRORS) {
    setTimeout(() => alert("Perdeste! A palavra era " + current.word), 100);
    document.querySelectorAll(".forca-key").forEach((b) => (b.disabled = true));
  }
}

function drawHangman() {
  const svg = document.getElementById("hangman-svg");
  const parts = [
    '<line x1="10" y1="150" x2="110" y2="150"/>',
    '<line x1="30" y1="150" x2="30" y2="15"/>',
    '<line x1="30" y1="15" x2="90" y2="15"/>',
    '<line x1="90" y1="15" x2="90" y2="35"/>',
    '<circle cx="90" cy="50" r="15"/>',
    '<line x1="90" y1="65" x2="90" y2="105"/>',
    '<line x1="90" y1="75" x2="70" y2="95"/>'
  ];
  const extra = errors >= 6 ? '<line x1="90" y1="75" x2="110" y2="95"/><line x1="90" y1="105" x2="72" y2="130"/><line x1="90" y1="105" x2="108" y2="130"/>' : "";
  svg.innerHTML = parts.slice(0, 4 + errors).join("") + (errors >= 6 ? extra : "");
}

document.getElementById("restart-btn").addEventListener("click", reset);
loadWins();
reset();
