const SIZE = 6;
const BOX_R = 2, BOX_C = 3;
let solution, puzzle, fixed, selected;

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function validAt(grid, r, c, val) {
  for (let i = 0; i < SIZE; i++) {
    if (grid[r][i] === val || grid[i][c] === val) return false;
  }
  const br = Math.floor(r / BOX_R) * BOX_R, bc = Math.floor(c / BOX_C) * BOX_C;
  for (let i = 0; i < BOX_R; i++)
    for (let j = 0; j < BOX_C; j++)
      if (grid[br + i][bc + j] === val) return false;
  return true;
}

function fillGrid(grid, pos) {
  if (pos === SIZE * SIZE) return true;
  const r = Math.floor(pos / SIZE), c = pos % SIZE;
  for (const val of shuffle([1, 2, 3, 4, 5, 6])) {
    if (validAt(grid, r, c, val)) {
      grid[r][c] = val;
      if (fillGrid(grid, pos + 1)) return true;
      grid[r][c] = 0;
    }
  }
  return false;
}

function generatePuzzle() {
  const grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  fillGrid(grid, 0);
  solution = grid.map((row) => row.slice());
  puzzle = grid.map((row) => row.slice());
  fixed = Array.from({ length: SIZE }, () => Array(SIZE).fill(true));

  const cells = [];
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) cells.push([r, c]);
  shuffle(cells).slice(0, 20).forEach(([r, c]) => {
    puzzle[r][c] = 0;
    fixed[r][c] = false;
  });
}

function reset() {
  generatePuzzle();
  selected = null;
  document.getElementById("status").textContent = "Preenche a grelha sem repetir números na linha, coluna ou caixa.";
  renderBoard();
  renderNumpad();
}

function renderBoard() {
  const board = document.getElementById("board");
  board.innerHTML = "";
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const cell = document.createElement("div");
      let cls = "sudoku-cell";
      if (fixed[r][c]) cls += " fixed";
      if (selected && selected[0] === r && selected[1] === c) cls += " selected";
      if ((c + 1) % BOX_C === 0 && c !== SIZE - 1) cls += " box-b";
      if ((r + 1) % BOX_R === 0 && r !== SIZE - 1) cls += " row-b";
      cell.className = cls;
      cell.textContent = puzzle[r][c] || "";
      cell.addEventListener("click", () => {
        if (fixed[r][c]) return;
        selected = [r, c];
        renderBoard();
      });
      board.appendChild(cell);
    }
  }
}

function renderNumpad() {
  const pad = document.getElementById("numpad");
  pad.innerHTML = "";
  for (let n = 1; n <= 6; n++) {
    const btn = document.createElement("button");
    btn.textContent = n;
    btn.addEventListener("click", () => placeNumber(n));
    pad.appendChild(btn);
  }
  const clearBtn = document.createElement("button");
  clearBtn.textContent = "✕";
  clearBtn.addEventListener("click", () => placeNumber(0));
  pad.appendChild(clearBtn);
}

function placeNumber(n) {
  if (!selected) return;
  const [r, c] = selected;
  puzzle[r][c] = n;
  renderBoard();
  checkComplete();
}

function checkComplete() {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (puzzle[r][c] === 0) return;
      if (puzzle[r][c] !== solution[r][c]) return;
    }
  }
  document.getElementById("status").textContent = "🎉 Sudoku resolvido!";
  setTimeout(() => alert("Parabéns! Resolveste o sudoku."), 100);
}

document.getElementById("restart-btn").addEventListener("click", reset);
reset();
