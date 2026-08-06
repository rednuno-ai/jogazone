const buttons = [...document.querySelectorAll(".pad-btn")];
let sequence, playerIndex, round, best, accepting;

function loadBest() {
  best = Number(localStorage.getItem("jogazone-simon-best") || 0);
  document.getElementById("best").textContent = best;
}

function lightUp(idx, duration = 400) {
  return new Promise((resolve) => {
    buttons[idx].classList.add("lit");
    setTimeout(() => {
      buttons[idx].classList.remove("lit");
      setTimeout(resolve, 150);
    }, duration);
  });
}

async function playSequence() {
  accepting = false;
  document.getElementById("status").textContent = "Observa...";
  for (const idx of sequence) {
    await lightUp(idx);
  }
  playerIndex = 0;
  accepting = true;
  document.getElementById("status").textContent = "A tua vez!";
}

function nextRound() {
  round++;
  document.getElementById("round").textContent = round;
  sequence.push(Math.floor(Math.random() * 4));
  playSequence();
}

function startGame() {
  sequence = [];
  round = 0;
  document.getElementById("round").textContent = 0;
  nextRound();
}

function gameOver() {
  accepting = false;
  document.getElementById("status").textContent = `Falhaste na ronda ${round}. Tenta outra vez!`;
  if (round - 1 > best) {
    best = round - 1;
    localStorage.setItem("jogazone-simon-best", String(best));
    document.getElementById("best").textContent = best;
  }
}

buttons.forEach((btn) => {
  btn.addEventListener("click", async () => {
    if (!accepting) return;
    const idx = Number(btn.dataset.color);
    await lightUp(idx, 200);
    if (idx !== sequence[playerIndex]) {
      gameOver();
      return;
    }
    playerIndex++;
    if (playerIndex === sequence.length) {
      accepting = false;
      setTimeout(nextRound, 500);
    }
  });
});

document.getElementById("start-btn").addEventListener("click", startGame);
loadBest();
