const SIZE = 8;
const EMPTY = 0, BLACK = 1, WHITE = 2;
const DIRS = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];

const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const blackScoreEl = document.getElementById("black-score");
const whiteScoreEl = document.getElementById("white-score");
const restartBtn = document.getElementById("restart-btn");

let grid, turn, over;

function reset() {
  grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(EMPTY));
  const m = SIZE / 2;
  grid[m-1][m-1] = WHITE;
  grid[m][m] = WHITE;
  grid[m-1][m] = BLACK;
  grid[m][m-1] = BLACK;
  turn = BLACK;
  over = false;
  statusEl.textContent = "A tua vez";
  render();
}

function inBounds(r, c) { return r >= 0 && r < SIZE && c >= 0 && c < SIZE; }

function flipsFor(r, c, player, g) {
  if (g[r][c] !== EMPTY) return [];
  const opp = player === BLACK ? WHITE : BLACK;
  let allFlips = [];
  for (const [dr, dc] of DIRS) {
    let rr = r + dr, cc = c + dc;
    const line = [];
    while (inBounds(rr, cc) && g[rr][cc] === opp) {
      line.push([rr, cc]);
      rr += dr; cc += dc;
    }
    if (line.length && inBounds(rr, cc) && g[rr][cc] === player) {
      allFlips = allFlips.concat(line);
    }
  }
  return allFlips;
}

function validMoves(player, g) {
  const moves = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const flips = flipsFor(r, c, player, g);
      if (flips.length) moves.push({ r, c, flips });
    }
  }
  return moves;
}

function applyMove(move, player) {
  grid[move.r][move.c] = player;
  move.flips.forEach(([r, c]) => { grid[r][c] = player; });
}

function countPieces() {
  let black = 0, white = 0;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === BLACK) black++;
      else if (grid[r][c] === WHITE) white++;
    }
  }
  return { black, white };
}

const CORNER_BONUS = new Set(["0,0", "0,7", "7,0", "7,7"]);

function computerMove() {
  const moves = validMoves(WHITE, grid);
  if (!moves.length) return false;
  let best = moves[0], bestScore = -Infinity;
  for (const m of moves) {
    let score = m.flips.length;
    if (CORNER_BONUS.has(`${m.r},${m.c}`)) score += 10;
    if (score > bestScore) { bestScore = score; best = m; }
  }
  applyMove(best, WHITE);
  return true;
}

function endTurnCheck() {
  const { black, white } = countPieces();
  blackScoreEl.textContent = black;
  whiteScoreEl.textContent = white;

  const blackMoves = validMoves(BLACK, grid);
  const whiteMoves = validMoves(WHITE, grid);

  if (!blackMoves.length && !whiteMoves.length) {
    over = true;
    if (black > white) statusEl.textContent = `Fim de jogo! Venceste ${black} - ${white} 🎉`;
    else if (white > black) statusEl.textContent = `Fim de jogo! Computador venceu ${white} - ${black}`;
    else statusEl.textContent = "Fim de jogo! Empate.";
    render();
    return;
  }

  if (turn === BLACK && !blackMoves.length) {
    statusEl.textContent = "Sem jogadas válidas — passas a vez";
    turn = WHITE;
    setTimeout(() => { computerMove(); turn = BLACK; endTurnCheck(); }, 500);
    render();
    return;
  }

  if (turn === WHITE) {
    if (whiteMoves.length) {
      setTimeout(() => {
        computerMove();
        turn = BLACK;
        endTurnCheck();
      }, 450);
    } else {
      turn = BLACK;
      endTurnCheck();
    }
    return;
  }

  statusEl.textContent = "A tua vez";
  render();
}

function render() {
  boardEl.innerHTML = "";
  const moves = (!over && turn === BLACK) ? validMoves(BLACK, grid) : [];
  const validSet = new Set(moves.map((m) => `${m.r},${m.c}`));

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const cell = document.createElement("div");
      cell.className = "rv-cell";
      if (validSet.has(`${r},${c}`)) cell.classList.add("valid");
      if (grid[r][c] !== EMPTY) {
        const piece = document.createElement("div");
        piece.className = "rv-piece " + (grid[r][c] === BLACK ? "black" : "white");
        cell.appendChild(piece);
      }
      cell.addEventListener("click", () => {
        if (over || turn !== BLACK) return;
        const move = moves.find((m) => m.r === r && m.c === c);
        if (!move) return;
        applyMove(move, BLACK);
        turn = WHITE;
        endTurnCheck();
      });
      boardEl.appendChild(cell);
    }
  }
}

restartBtn.addEventListener("click", reset);
reset();
