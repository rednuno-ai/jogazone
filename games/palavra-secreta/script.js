const WORDS = [
  "AMIGO", "BARCO", "CARRO", "DENTE", "FESTA", "GATOS", "HOTEL", "IGUAL",
  "LIVRO", "MOEDA", "NAVIO", "PORTA", "QUEDA", "RATOS", "SALTO", "TERRA",
  "UNHAS", "VERDE", "ZEBRA", "ABRIL", "BOLSA", "CAMPO", "DOCES", "FALAR",
  "GRAOS", "HORAS", "IDEIA", "JOGOS", "LARGO", "MUNDO", "NORTE", "OUVIR",
  "PONTE", "SONHO", "TIGRE", "VALOR", "AGUAS", "BRAVO", "CARTA", "PEDRA",
  "MARES", "LEITE", "FRUTA", "PEIXE", "NUVEM", "TROVA",
];

const KEY_ROWS = [
  "QWERTYUIOP".split(""),
  "ASDFGHJKL".split(""),
  ["ENTER", ..."ZXCVBNM".split(""), "DEL"],
];

const gridEl = document.getElementById("grid");
const keyboardEl = document.getElementById("keyboard");
const statusEl = document.getElementById("status");
const attemptEl = document.getElementById("attempt");

let secret, rows, current, row, over, keyStates;

function reset() {
  secret = WORDS[Math.floor(Math.random() * WORDS.length)];
  rows = Array.from({ length: 6 }, () => "");
  current = "";
  row = 0;
  over = false;
  keyStates = {};
  attemptEl.textContent = 1;
  statusEl.innerHTML = 'Tentativa <strong id="attempt">1</strong>/6';
  renderGrid();
  renderKeyboard();
}

function evaluateGuess(guess) {
  const result = Array(5).fill("absent");
  const secretArr = secret.split("");
  const guessArr = guess.split("");
  for (let i = 0; i < 5; i++) {
    if (guessArr[i] === secretArr[i]) {
      result[i] = "correct";
      secretArr[i] = null;
      guessArr[i] = null;
    }
  }
  for (let i = 0; i < 5; i++) {
    if (guessArr[i] === null) continue;
    const idx = secretArr.indexOf(guessArr[i]);
    if (idx !== -1) {
      result[i] = "present";
      secretArr[idx] = null;
    }
  }
  return result;
}

function renderGrid(evalResults) {
  gridEl.innerHTML = "";
  for (let r = 0; r < 6; r++) {
    const rowEl = document.createElement("div");
    rowEl.className = "ps-row";
    const word = r === row ? current : rows[r];
    for (let c = 0; c < 5; c++) {
      const tile = document.createElement("div");
      tile.className = "ps-tile";
      tile.textContent = word[c] || "";
      if (r < row && rows[r]) {
        const res = evaluateGuess(rows[r]);
        tile.classList.add(res[c]);
      }
      rowEl.appendChild(tile);
    }
    gridEl.appendChild(rowEl);
  }
}

function renderKeyboard() {
  keyboardEl.innerHTML = "";
  KEY_ROWS.forEach((krow) => {
    const rEl = document.createElement("div");
    rEl.className = "ps-krow";
    krow.forEach((k) => {
      const btn = document.createElement("button");
      btn.className = "ps-key" + (k.length > 1 ? " wide" : "");
      btn.textContent = k === "DEL" ? "⌫" : k;
      if (keyStates[k]) btn.classList.add(keyStates[k]);
      btn.addEventListener("click", () => handleKey(k));
      rEl.appendChild(btn);
    });
    keyboardEl.appendChild(rEl);
  });
}

function handleKey(k) {
  if (over) return;
  if (k === "DEL") {
    current = current.slice(0, -1);
  } else if (k === "ENTER") {
    submitGuess();
    return;
  } else if (current.length < 5) {
    current += k;
  }
  renderGrid();
}

function submitGuess() {
  if (current.length !== 5) {
    statusEl.textContent = "Escreve 5 letras primeiro";
    return;
  }
  const guess = current;
  const result = evaluateGuess(guess);
  guess.split("").forEach((letter, i) => {
    const state = result[i];
    const rank = { absent: 0, present: 1, correct: 2 };
    if (!keyStates[letter] || rank[state] > rank[keyStates[letter]]) {
      keyStates[letter] = state;
    }
  });
  rows[row] = guess;

  if (guess === secret) {
    over = true;
    row++;
    renderGrid();
    renderKeyboard();
    statusEl.textContent = `Acertaste! A palavra era ${secret} 🎉`;
    return;
  }

  row++;
  current = "";
  if (row >= 6) {
    over = true;
    renderGrid();
    renderKeyboard();
    statusEl.textContent = `Fim de jogo! A palavra era ${secret}`;
    return;
  }
  attemptEl.textContent = row + 1;
  statusEl.innerHTML = `Tentativa <strong>${row + 1}</strong>/6`;
  renderGrid();
  renderKeyboard();
}

window.addEventListener("keydown", (e) => {
  if (over) return;
  if (e.key === "Enter") handleKey("ENTER");
  else if (e.key === "Backspace") handleKey("DEL");
  else if (/^[a-zA-Z]$/.test(e.key)) handleKey(e.key.toUpperCase());
});

reset();
