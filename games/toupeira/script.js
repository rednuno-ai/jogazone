const HOLES = 9;
let holeEls, score, best, timeLeft, running, popTimer, timerId, activeIdx;

function loadBest() {
  best = Number(localStorage.getItem("jogazone-toupeira-best") || 0);
  document.getElementById("best").textContent = best;
}

function buildGrid() {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";
  holeEls = [];
  for (let i = 0; i < HOLES; i++) {
    const hole = document.createElement("div");
    hole.className = "mole-hole";
    const mole = document.createElement("div");
    mole.className = "mole";
    mole.textContent = "🐹";
    mole.addEventListener("click", () => whack(i));
    hole.appendChild(mole);
    grid.appendChild(hole);
    holeEls.push(hole);
  }
}

function popMole() {
  if (activeIdx !== null) holeEls[activeIdx].classList.remove("up");
  const idx = Math.floor(Math.random() * HOLES);
  activeIdx = idx;
  holeEls[idx].classList.add("up");
  holeEls[idx].classList.remove("hit");
  const duration = Math.max(450, 950 - score * 5);
  popTimer = setTimeout(() => {
    if (holeEls[idx].classList.contains("up")) holeEls[idx].classList.remove("up");
    if (running) popMole();
  }, duration);
}

function whack(idx) {
  if (!running || idx !== activeIdx || !holeEls[idx].classList.contains("up")) return;
  holeEls[idx].classList.add("hit");
  holeEls[idx].classList.remove("up");
  score++;
  document.getElementById("score").textContent = score;
}

function start() {
  buildGrid();
  score = 0;
  timeLeft = 30;
  running = true;
  activeIdx = null;
  document.getElementById("score").textContent = 0;
  document.getElementById("timer").textContent = timeLeft;

  clearTimeout(popTimer);
  clearInterval(timerId);
  popMole();
  timerId = setInterval(() => {
    timeLeft--;
    document.getElementById("timer").textContent = timeLeft;
    if (timeLeft <= 0) endGame();
  }, 1000);
}

function endGame() {
  running = false;
  clearTimeout(popTimer);
  clearInterval(timerId);
  if (score > best) {
    best = score;
    localStorage.setItem("jogazone-toupeira-best", String(best));
    document.getElementById("best").textContent = best;
  }
  setTimeout(() => alert(`Fim de jogo! Apanhaste ${score} toupeiras.`), 100);
}

document.getElementById("restart-btn").addEventListener("click", start);
loadBest();
start();
