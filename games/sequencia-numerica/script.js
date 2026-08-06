const pad = document.getElementById("pad");
const buttons = [];
for (let i = 1; i <= 9; i++) {
  const btn = document.createElement("button");
  btn.className = "num-btn";
  btn.textContent = i;
  btn.addEventListener("click", () => onPress(i));
  pad.appendChild(btn);
  buttons.push(btn);
}

let sequence, playerIndex, round, best, accepting;

function loadBest() {
  best = Number(localStorage.getItem("jogazone-seqnum-best") || 0);
  document.getElementById("best").textContent = best;
}

function lightUp(n, duration = 500) {
  return new Promise((resolve) => {
    const btn = buttons[n - 1];
    btn.classList.add("lit");
    setTimeout(() => {
      btn.classList.remove("lit");
      setTimeout(resolve, 200);
    }, duration);
  });
}

async function playSequence() {
  accepting = false;
  document.getElementById("status").textContent = "Observa...";
  for (const n of sequence) await lightUp(n);
  playerIndex = 0;
  accepting = true;
  document.getElementById("status").textContent = "A tua vez!";
}

function nextRound() {
  round++;
  document.getElementById("round").textContent = round;
  sequence.push(1 + Math.floor(Math.random() * 9));
  playSequence();
}

function start() {
  sequence = [];
  round = 0;
  document.getElementById("round").textContent = 0;
  document.getElementById("start-btn").style.display = "none";
  nextRound();
}

function gameOver() {
  accepting = false;
  document.getElementById("status").textContent = `Falhaste na ronda ${round}.`;
  document.getElementById("start-btn").style.display = "inline-block";
  document.getElementById("start-btn").textContent = "Jogar novamente";
  if (round - 1 > best) {
    best = round - 1;
    localStorage.setItem("jogazone-seqnum-best", String(best));
    document.getElementById("best").textContent = best;
  }
}

function onPress(n) {
  if (!accepting) return;
  lightUp(n, 200);
  if (n !== sequence[playerIndex]) return gameOver();
  playerIndex++;
  if (playerIndex === sequence.length) {
    accepting = false;
    setTimeout(nextRound, 600);
  }
}

document.getElementById("start-btn").addEventListener("click", start);
loadBest();
