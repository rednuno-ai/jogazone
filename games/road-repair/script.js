const ROWS = 4, COLS = 5;
let cells, score, best, timeLeft, running, spawnId, timerId;

function loadBest() {
  best = Number(localStorage.getItem("jogazone-roadrepair-best") || 0);
  document.getElementById("best").textContent = best;
}

function buildGrid() {
  const grid = document.getElementById("road-grid");
  grid.innerHTML = "";
  cells = [];
  for (let i = 0; i < ROWS * COLS; i++) {
    const cell = document.createElement("div");
    cell.className = "road-cell";
    cell.addEventListener("click", () => onCellClick(i));
    grid.appendChild(cell);
    cells.push(cell);
  }
}

function spawnHole() {
  const empties = cells.map((c, i) => (!c.classList.contains("hole") ? i : -1)).filter((i) => i >= 0);
  if (empties.length === 0) return;
  const idx = empties[Math.floor(Math.random() * empties.length)];
  cells[idx].classList.add("hole");
  cells[idx].textContent = "🕳️";
  setTimeout(() => {
    if (cells[idx].classList.contains("hole")) {
      cells[idx].classList.remove("hole");
      cells[idx].textContent = "";
    }
  }, 1300);
}

function onCellClick(idx) {
  if (!running) return;
  if (cells[idx].classList.contains("hole")) {
    cells[idx].classList.remove("hole");
    cells[idx].textContent = "✅";
    score++;
    document.getElementById("score").textContent = score;
    setTimeout(() => { cells[idx].textContent = ""; }, 200);
  }
}

function start() {
  score = 0;
  timeLeft = 30;
  running = true;
  document.getElementById("score").textContent = 0;
  document.getElementById("timer").textContent = timeLeft;
  buildGrid();

  clearInterval(spawnId);
  clearInterval(timerId);
  spawnId = setInterval(spawnHole, 650);
  timerId = setInterval(() => {
    timeLeft--;
    document.getElementById("timer").textContent = timeLeft;
    if (timeLeft <= 0) endGame();
  }, 1000);
}

function endGame() {
  running = false;
  clearInterval(spawnId);
  clearInterval(timerId);
  if (score > best) {
    best = score;
    localStorage.setItem("jogazone-roadrepair-best", String(best));
    document.getElementById("best").textContent = best;
  }
  setTimeout(() => alert(`Fim de jogo! Reparaste ${score} buracos.`), 100);
}

loadBest();
start();
