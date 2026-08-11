const COLORS = ["#ff5d73", "#ffd166", "#5da9ff", "#7ee8b5", "#c792ea", "#ff9a5a"];
const CODE_LEN = 4;
const MAX_ATTEMPTS = 10;

const picker = document.getElementById("picker");
const current = document.getElementById("current");
const board = document.getElementById("board");
const statusEl = document.getElementById("status");
const attemptEl = document.getElementById("attempt");
const confirmBtn = document.getElementById("confirm-btn");

let secret, guess, attempt, over;

function reset() {
  secret = Array.from({ length: CODE_LEN }, () => Math.floor(Math.random() * COLORS.length));
  guess = [];
  attempt = 1;
  over = false;
  attemptEl.textContent = attempt;
  statusEl.textContent = "Escolhe 4 cores e confirma";
  board.innerHTML = "";
  renderPicker();
  renderCurrent();
}

function renderPicker() {
  picker.innerHTML = "";
  COLORS.forEach((c, i) => {
    const sw = document.createElement("div");
    sw.className = "cs-swatch";
    sw.style.background = c;
    sw.addEventListener("click", () => {
      if (over || guess.length >= CODE_LEN) return;
      guess.push(i);
      renderCurrent();
    });
    picker.appendChild(sw);
  });
}

function renderCurrent() {
  current.innerHTML = "";
  for (let i = 0; i < CODE_LEN; i++) {
    const slot = document.createElement("div");
    if (guess[i] !== undefined) {
      slot.className = "cs-swatch";
      slot.style.background = COLORS[guess[i]];
      slot.title = "Clica para remover";
      slot.addEventListener("click", () => {
        guess.splice(i, 1);
        renderCurrent();
      });
    } else {
      slot.className = "cs-slot";
    }
    current.appendChild(slot);
  }
}

function evaluate(g) {
  const secretCopy = [...secret];
  const guessCopy = [...g];
  let black = 0;
  for (let i = 0; i < CODE_LEN; i++) {
    if (guessCopy[i] === secretCopy[i]) {
      black++;
      guessCopy[i] = null;
      secretCopy[i] = null;
    }
  }
  let white = 0;
  for (let i = 0; i < CODE_LEN; i++) {
    if (guessCopy[i] === null) continue;
    const idx = secretCopy.indexOf(guessCopy[i]);
    if (idx !== -1) {
      white++;
      secretCopy[idx] = null;
    }
  }
  return { black, white };
}

function renderRow(g, result) {
  const row = document.createElement("div");
  row.className = "cs-row";

  const dots = document.createElement("div");
  dots.className = "cs-dots";
  g.forEach((ci) => {
    const dot = document.createElement("div");
    dot.className = "cs-dot";
    dot.style.background = COLORS[ci];
    dots.appendChild(dot);
  });
  row.appendChild(dots);

  const pegs = document.createElement("div");
  pegs.className = "cs-pegs";
  const total = [];
  for (let i = 0; i < result.black; i++) total.push("black");
  for (let i = 0; i < result.white; i++) total.push("white");
  while (total.length < CODE_LEN) total.push("empty");
  total.forEach((t) => {
    const p = document.createElement("div");
    p.className = "cs-peg " + t;
    pegs.appendChild(p);
  });
  row.appendChild(pegs);

  board.appendChild(row);
}

confirmBtn.addEventListener("click", () => {
  if (over) { reset(); return; }
  if (guess.length < CODE_LEN) {
    statusEl.textContent = "Escolhe as 4 cores primeiro";
    return;
  }
  const result = evaluate(guess);
  renderRow(guess, result);

  if (result.black === CODE_LEN) {
    statusEl.textContent = `Acertaste na tentativa ${attempt}! 🎉`;
    over = true;
    confirmBtn.textContent = "Jogar de novo";
    return;
  }

  if (attempt >= MAX_ATTEMPTS) {
    statusEl.textContent = "Fim de jogo! Não descobriste a combinação.";
    over = true;
    confirmBtn.textContent = "Jogar de novo";
    return;
  }

  attempt++;
  attemptEl.textContent = attempt;
  guess = [];
  renderCurrent();
  statusEl.textContent = `${result.black} certos, ${result.white} na posição errada`;
});

reset();
