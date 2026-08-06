const SIZE = 8;
let board, selected, myTurn, over;

function initBoard() {
  const g = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < SIZE; c++) {
      if ((r + c) % 2 === 1) g[r][c] = { owner: "ai", king: false };
    }
  }
  for (let r = 5; r < 8; r++) {
    for (let c = 0; c < SIZE; c++) {
      if ((r + c) % 2 === 1) g[r][c] = { owner: "me", king: false };
    }
  }
  return g;
}

function reset() {
  board = initBoard();
  selected = null;
  myTurn = true;
  over = false;
  document.getElementById("status").textContent = "A tua vez (peças escuras)";
  updateCounts();
  render();
}

function updateCounts() {
  let me = 0, ai = 0;
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (board[r][c]) { if (board[r][c].owner === "me") me++; else ai++; }
  document.getElementById("my-count").textContent = me;
  document.getElementById("ai-count").textContent = ai;
  return { me, ai };
}

function pieceMoves(r, c) {
  const piece = board[r][c];
  if (!piece) return [];
  const dirs = piece.king
    ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
    : piece.owner === "me" ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]];
  const moves = [];
  for (const [dr, dc] of dirs) {
    const nr = r + dr, nc = c + dc;
    if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && !board[nr][nc]) {
      moves.push({ to: [nr, nc], capture: null });
    } else if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && board[nr][nc] && board[nr][nc].owner !== piece.owner) {
      const jr = nr + dr, jc = nc + dc;
      if (jr >= 0 && jr < SIZE && jc >= 0 && jc < SIZE && !board[jr][jc]) {
        moves.push({ to: [jr, jc], capture: [nr, nc] });
      }
    }
  }
  return moves;
}

function allMoves(owner) {
  const result = [];
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (board[r][c] && board[r][c].owner === owner) {
        pieceMoves(r, c).forEach((m) => result.push({ from: [r, c], ...m }));
      }
  return result;
}

function applyMove(move) {
  const [fr, fc] = move.from, [tr, tc] = move.to;
  board[tr][tc] = board[fr][fc];
  board[fr][fc] = null;
  if (move.capture) board[move.capture[0]][move.capture[1]] = null;
  if (tr === 0 && board[tr][tc].owner === "me") board[tr][tc].king = true;
  if (tr === SIZE - 1 && board[tr][tc].owner === "ai") board[tr][tc].king = true;
}

function render() {
  const boardEl = document.getElementById("board");
  boardEl.innerHTML = "";
  const validTargets = selected ? pieceMoves(selected[0], selected[1]).map((m) => m.to.join(",")) : [];

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const cell = document.createElement("div");
      const dark = (r + c) % 2 === 1;
      cell.className = "dama-cell " + (dark ? "dark" : "light");
      if (selected && selected[0] === r && selected[1] === c) cell.classList.add("selected");
      if (validTargets.includes(r + "," + c)) cell.classList.add("valid-move");

      const piece = board[r][c];
      if (piece) {
        const p = document.createElement("div");
        p.className = "dama-piece " + piece.owner + (piece.king ? " king" : "");
        cell.appendChild(p);
      }

      if (dark) cell.addEventListener("click", () => onCellClick(r, c));
      boardEl.appendChild(cell);
    }
  }
}

function onCellClick(r, c) {
  if (over || !myTurn) return;
  const piece = board[r][c];
  if (piece && piece.owner === "me") {
    selected = [r, c];
    render();
    return;
  }
  if (selected) {
    const moves = pieceMoves(selected[0], selected[1]);
    const move = moves.find((m) => m.to[0] === r && m.to[1] === c);
    if (move) {
      applyMove({ from: selected, ...move });
      selected = null;
      const counts = updateCounts();
      render();
      if (counts.ai === 0) return endGame("Ganhaste! 🎉");
      myTurn = false;
      document.getElementById("status").textContent = "O rival está a jogar...";
      setTimeout(aiMove, 500);
    }
  }
}

function aiMove() {
  if (over) return;
  const moves = allMoves("ai");
  if (moves.length === 0) return endGame("Ganhaste! O rival não tem jogadas.");
  const captures = moves.filter((m) => m.capture);
  const move = (captures.length ? captures : moves)[Math.floor(Math.random() * (captures.length ? captures.length : moves.length))];
  applyMove(move);
  const counts = updateCounts();
  render();
  if (counts.me === 0) return endGame("O rival ganhou.");
  myTurn = true;
  document.getElementById("status").textContent = "A tua vez (peças escuras)";
}

function endGame(msg) {
  over = true;
  document.getElementById("status").textContent = msg;
}

document.getElementById("restart-btn").addEventListener("click", reset);
reset();
