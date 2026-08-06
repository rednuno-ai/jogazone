const ROWS = 6, COLS = 7;
let grid, gameOver, turn;

function reset() {
  grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  gameOver = false;
  turn = 1;
  document.getElementById("status").textContent = "A tua vez (vermelho)";
  render();
}

function render() {
  const board = document.getElementById("board");
  board.innerHTML = "";
  for (let c = 0; c < COLS; c++) {
    const col = document.createElement("div");
    col.className = "c4-col";
    col.style.display = "contents";
    for (let r = 0; r < ROWS; r++) {
      const cell = document.createElement("div");
      const v = grid[r][c];
      cell.className = "c4-cell " + (v === 1 ? "p1" : v === 2 ? "p2" : "empty");
      cell.addEventListener("click", () => onColumnClick(c));
      board.appendChild(cell);
    }
  }
}

function dropPiece(col, player) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (grid[r][col] === 0) {
      grid[r][col] = player;
      return r;
    }
  }
  return -1;
}

function checkWin(player) {
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c] !== player) continue;
      for (const [dr, dc] of dirs) {
        let count = 1;
        for (let i = 1; i < 4; i++) {
          const nr = r + dr * i, nc = c + dc * i;
          if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS || grid[nr][nc] !== player) break;
          count++;
        }
        if (count >= 4) return true;
      }
    }
  }
  return false;
}

function validCols() {
  const cols = [];
  for (let c = 0; c < COLS; c++) if (grid[0][c] === 0) cols.push(c);
  return cols;
}

function onColumnClick(col) {
  if (gameOver || turn !== 1) return;
  if (grid[0][col] !== 0) return;
  dropPiece(col, 1);
  render();
  if (checkWin(1)) return endGame("Ganhaste! 🎉");
  if (validCols().length === 0) return endGame("Empate!");
  turn = 2;
  document.getElementById("status").textContent = "O computador está a pensar...";
  setTimeout(computerMove, 450);
}

function computerMove() {
  if (gameOver) return;
  const cols = validCols();

  for (const c of cols) {
    const r = dropPiece(c, 2);
    const win = checkWin(2);
    grid[r][c] = 0;
    if (win) { dropPiece(c, 2); render(); if (checkWin(2)) return endGame("O computador ganhou."); }
  }
  for (const c of cols) {
    const r = dropPiece(c, 1);
    const win = checkWin(1);
    grid[r][c] = 0;
    if (win) {
      dropPiece(c, 2);
      render();
      turn = 1;
      document.getElementById("status").textContent = "A tua vez (vermelho)";
      return;
    }
  }

  const col = cols[Math.floor(Math.random() * cols.length)];
  dropPiece(col, 2);
  render();
  if (checkWin(2)) return endGame("O computador ganhou.");
  if (validCols().length === 0) return endGame("Empate!");
  turn = 1;
  document.getElementById("status").textContent = "A tua vez (vermelho)";
}

function endGame(msg) {
  gameOver = true;
  document.getElementById("status").textContent = msg;
}

document.getElementById("restart-btn").addEventListener("click", reset);
reset();
