const SIZE = 10;
const MINES = 15;
let grid, revealed, flagged, firstClick, over, cellsEl;

function reset() {
  grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  revealed = Array.from({ length: SIZE }, () => Array(SIZE).fill(false));
  flagged = Array.from({ length: SIZE }, () => Array(SIZE).fill(false));
  firstClick = true;
  over = false;
  document.getElementById("mines-left").textContent = MINES;
  document.getElementById("status").textContent = "Clica para revelar. Botão direito para marcar.";
  render();
}

function placeMines(avoidR, avoidC) {
  let placed = 0;
  while (placed < MINES) {
    const r = Math.floor(Math.random() * SIZE), c = Math.floor(Math.random() * SIZE);
    if (grid[r][c] === "M") continue;
    if (Math.abs(r - avoidR) <= 1 && Math.abs(c - avoidC) <= 1) continue;
    grid[r][c] = "M";
    placed++;
  }
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === "M") continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && grid[nr][nc] === "M") count++;
        }
      grid[r][c] = count;
    }
  }
}

function floodReveal(r, c) {
  if (r < 0 || r >= SIZE || c < 0 || c >= SIZE || revealed[r][c] || flagged[r][c]) return;
  revealed[r][c] = true;
  if (grid[r][c] === 0) {
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++)
        if (dr || dc) floodReveal(r + dr, c + dc);
  }
}

function checkWin() {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (grid[r][c] !== "M" && !revealed[r][c]) return false;
  return true;
}

function onCellClick(r, c) {
  if (over || flagged[r][c] || revealed[r][c]) return;
  if (firstClick) {
    placeMines(r, c);
    firstClick = false;
  }
  if (grid[r][c] === "M") {
    revealed[r][c] = true;
    over = true;
    document.getElementById("status").textContent = "💥 Rebentaste numa mina!";
    render(true);
    return;
  }
  floodReveal(r, c);
  render();
  if (checkWin()) {
    over = true;
    document.getElementById("status").textContent = "🎉 Campo limpo!";
  }
}

function onCellRightClick(e, r, c) {
  e.preventDefault();
  if (over || revealed[r][c]) return;
  flagged[r][c] = !flagged[r][c];
  const left = MINES - flagged.flat().filter(Boolean).length;
  document.getElementById("mines-left").textContent = left;
  render();
}

function render(showAllMines) {
  const board = document.getElementById("board");
  board.innerHTML = "";
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const cell = document.createElement("div");
      cell.className = "mine-cell";
      if (revealed[r][c]) {
        cell.classList.add("revealed");
        if (grid[r][c] === "M") { cell.classList.add("mine"); cell.textContent = "💣"; }
        else if (grid[r][c] > 0) {
          cell.textContent = grid[r][c];
          const colors = ["", "#5da9ff", "#7ee8b5", "#ff5d73", "#c58bff", "#ffd166", "#ff9a5a", "#eef0fb", "#a4a9c8"];
          cell.style.color = colors[grid[r][c]];
        }
      } else if (flagged[r][c]) {
        cell.classList.add("flag");
        cell.textContent = "🚩";
      } else if (showAllMines && grid[r][c] === "M") {
        cell.classList.add("mine");
        cell.textContent = "💣";
      }
      cell.addEventListener("click", () => onCellClick(r, c));
      cell.addEventListener("contextmenu", (e) => onCellRightClick(e, r, c));
      board.appendChild(cell);
    }
  }
}

document.getElementById("restart-btn").addEventListener("click", reset);
reset();
