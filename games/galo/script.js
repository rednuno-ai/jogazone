const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

let cells, current, gameOver;
const stats = { wins: 0, draws: 0, losses: 0 };

function loadStats() {
  const saved = JSON.parse(localStorage.getItem("jogazone-galo-stats") || "null");
  if (saved) Object.assign(stats, saved);
  updateStatsUI();
}

function saveStats() {
  localStorage.setItem("jogazone-galo-stats", JSON.stringify(stats));
  updateStatsUI();
}

function updateStatsUI() {
  document.getElementById("wins").textContent = stats.wins;
  document.getElementById("draws").textContent = stats.draws;
  document.getElementById("losses").textContent = stats.losses;
}

function reset() {
  cells = Array(9).fill(null);
  current = "X";
  gameOver = false;
  document.getElementById("status").textContent = "A tua vez (X)";
  render();
}

function render() {
  const board = document.getElementById("board");
  board.innerHTML = "";
  cells.forEach((val, idx) => {
    const cell = document.createElement("div");
    cell.className = "galo-cell" + (val ? " " + val.toLowerCase() : "");
    cell.textContent = val || "";
    cell.addEventListener("click", () => onCellClick(idx));
    board.appendChild(cell);
  });
}

function checkWinner(board) {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  if (board.every((v) => v)) return { winner: "draw" };
  return null;
}

function onCellClick(idx) {
  if (gameOver || cells[idx] || current !== "X") return;
  cells[idx] = "X";
  render();

  const result = checkWinner(cells);
  if (result) return endGame(result);

  current = "O";
  document.getElementById("status").textContent = "Vez do computador...";
  setTimeout(computerMove, 400);
}

function computerMove() {
  if (gameOver) return;
  const idx = bestMove(cells);
  if (idx !== -1) cells[idx] = "O";
  render();

  const result = checkWinner(cells);
  if (result) return endGame(result);

  current = "X";
  document.getElementById("status").textContent = "A tua vez (X)";
}

function bestMove(board) {
  let bestScore = -Infinity;
  let move = -1;
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = "O";
      const score = minimax(board, 0, false);
      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function minimax(board, depth, isMax) {
  const result = checkWinner(board);
  if (result) {
    if (result.winner === "O") return 10 - depth;
    if (result.winner === "X") return depth - 10;
    return 0;
  }

  if (isMax) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = "O";
        best = Math.max(best, minimax(board, depth + 1, false));
        board[i] = null;
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = "X";
        best = Math.min(best, minimax(board, depth + 1, true));
        board[i] = null;
      }
    }
    return best;
  }
}

function endGame(result) {
  gameOver = true;
  if (result.line) {
    result.line.forEach((idx) => {
      document.querySelectorAll(".galo-cell")[idx].classList.add("win");
    });
  }

  if (result.winner === "draw") {
    document.getElementById("status").textContent = "Empate!";
    stats.draws++;
  } else if (result.winner === "X") {
    document.getElementById("status").textContent = "Ganhaste! 🎉";
    stats.wins++;
  } else {
    document.getElementById("status").textContent = "O computador ganhou.";
    stats.losses++;
  }
  saveStats();
}

document.getElementById("restart-btn").addEventListener("click", reset);

loadStats();
reset();
