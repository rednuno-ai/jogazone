const COLS = 8, ROWS = 10;
const COLORS = ["#ff5d73", "#5da9ff", "#7ee8b5", "#ffd166", "#c58bff"];
let grid, score, best;

function loadBest() {
  best = Number(localStorage.getItem("jogazone-bolhas-best") || 0);
  document.getElementById("best").textContent = best;
}

function reset() {
  grid = Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => Math.floor(Math.random() * COLORS.length)));
  score = 0;
  document.getElementById("score").textContent = 0;
  render();
}

function render() {
  const board = document.getElementById("board");
  board.innerHTML = "";
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement("div");
      const val = grid[r][c];
      cell.className = "bubble" + (val === -1 ? " empty" : "");
      if (val !== -1) cell.style.background = COLORS[val];
      cell.addEventListener("click", () => onBubbleClick(r, c));
      board.appendChild(cell);
    }
  }
}

function findGroup(r, c) {
  const color = grid[r][c];
  if (color === -1) return [];
  const seen = new Set();
  const stack = [[r, c]];
  const group = [];
  while (stack.length) {
    const [rr, cc] = stack.pop();
    const key = rr + "," + cc;
    if (seen.has(key)) continue;
    if (rr < 0 || rr >= ROWS || cc < 0 || cc >= COLS) continue;
    if (grid[rr][cc] !== color) continue;
    seen.add(key);
    group.push([rr, cc]);
    stack.push([rr - 1, cc], [rr + 1, cc], [rr, cc - 1], [rr, cc + 1]);
  }
  return group;
}

function applyGravity() {
  for (let c = 0; c < COLS; c++) {
    const colVals = [];
    for (let r = 0; r < ROWS; r++) if (grid[r][c] !== -1) colVals.push(grid[r][c]);
    const empties = ROWS - colVals.length;
    for (let r = 0; r < ROWS; r++) {
      grid[r][c] = r < empties ? -1 : colVals[r - empties];
    }
  }
  // Remove colunas totalmente vazias (desliza para a esquerda)
  const nonEmptyCols = [];
  for (let c = 0; c < COLS; c++) {
    let hasAny = false;
    for (let r = 0; r < ROWS; r++) if (grid[r][c] !== -1) hasAny = true;
    if (hasAny) nonEmptyCols.push(c);
  }
  const newGrid = Array.from({ length: ROWS }, () => Array(COLS).fill(-1));
  nonEmptyCols.forEach((oldC, newC) => {
    for (let r = 0; r < ROWS; r++) newGrid[r][newC] = grid[r][oldC];
  });
  grid = newGrid;
}

function hasMoves() {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c] === -1) continue;
      if (findGroup(r, c).length >= 2) return true;
    }
  }
  return false;
}

function onBubbleClick(r, c) {
  const group = findGroup(r, c);
  if (group.length < 2) return;
  group.forEach(([rr, cc]) => { grid[rr][cc] = -1; });
  score += group.length * group.length;
  document.getElementById("score").textContent = score;
  applyGravity();
  render();

  if (!hasMoves()) {
    if (score > best) {
      best = score;
      localStorage.setItem("jogazone-bolhas-best", String(best));
      document.getElementById("best").textContent = best;
    }
    setTimeout(() => alert(`Sem mais jogadas! Pontuação final: ${score}`), 150);
  }
}

document.getElementById("restart-btn").addEventListener("click", reset);
loadBest();
reset();
