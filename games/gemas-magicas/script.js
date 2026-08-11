const SIZE = 8;
const GEM_COLORS = ["#ff5d73", "#ffd166", "#5da9ff", "#7ee8b5", "#c792ea", "#ff9a5a"];

const boardEl = document.getElementById("board");
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");

let grid, score, timeLeft, selected, busy, over, timerId;

function randGem() { return Math.floor(Math.random() * GEM_COLORS.length); }

function createBoard() {
  const g = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      let val;
      do {
        val = randGem();
      } while (
        (c >= 2 && g[r][c-1] === val && g[r][c-2] === val) ||
        (r >= 2 && g[r-1][c] === val && g[r-2][c] === val)
      );
      g[r][c] = val;
    }
  }
  return g;
}

function reset() {
  grid = createBoard();
  score = 0;
  timeLeft = 60;
  selected = null;
  busy = false;
  over = false;
  scoreEl.textContent = 0;
  timeEl.textContent = timeLeft;
  render();
  if (timerId) clearInterval(timerId);
  timerId = setInterval(() => {
    timeLeft--;
    timeEl.textContent = timeLeft;
    if (timeLeft <= 0) {
      over = true;
      clearInterval(timerId);
    }
  }, 1000);
}

function findMatches(g) {
  const matched = new Set();
  for (let r = 0; r < SIZE; r++) {
    let runStart = 0;
    for (let c = 1; c <= SIZE; c++) {
      if (c < SIZE && g[r][c] === g[r][runStart] && g[r][c] !== -1) continue;
      if (c - runStart >= 3) {
        for (let k = runStart; k < c; k++) matched.add(`${r},${k}`);
      }
      runStart = c;
    }
  }
  for (let c = 0; c < SIZE; c++) {
    let runStart = 0;
    for (let r = 1; r <= SIZE; r++) {
      if (r < SIZE && g[r][c] === g[runStart][c] && g[r][c] !== -1) continue;
      if (r - runStart >= 3) {
        for (let k = runStart; k < r; k++) matched.add(`${k},${c}`);
      }
      runStart = r;
    }
  }
  return matched;
}

function dropAndFill() {
  for (let c = 0; c < SIZE; c++) {
    let write = SIZE - 1;
    for (let r = SIZE - 1; r >= 0; r--) {
      if (grid[r][c] !== -1) {
        grid[write][c] = grid[r][c];
        write--;
      }
    }
    for (let r = write; r >= 0; r--) grid[r][c] = randGem();
  }
}

function resolveMatches(cascade) {
  const matched = findMatches(grid);
  if (!matched.size) {
    busy = false;
    render();
    return;
  }
  score += matched.size * 10 * cascade;
  scoreEl.textContent = score;
  matched.forEach((key) => {
    const [r, c] = key.split(",").map(Number);
    grid[r][c] = -1;
  });
  render(matched);
  setTimeout(() => {
    dropAndFill();
    render();
    setTimeout(() => resolveMatches(cascade + 1), 150);
  }, 220);
}

function trySwap(r1, c1, r2, c2) {
  busy = true;
  [grid[r1][c1], grid[r2][c2]] = [grid[r2][c2], grid[r1][c1]];
  const matched = findMatches(grid);
  if (!matched.size) {
    setTimeout(() => {
      [grid[r1][c1], grid[r2][c2]] = [grid[r2][c2], grid[r1][c1]];
      busy = false;
      render();
    }, 180);
    render();
  } else {
    render();
    setTimeout(() => resolveMatches(1), 180);
  }
}

function isAdjacent(a, b) {
  return (Math.abs(a.r - b.r) === 1 && a.c === b.c) || (Math.abs(a.c - b.c) === 1 && a.r === b.r);
}

function render(clearingSet) {
  boardEl.innerHTML = "";
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const cell = document.createElement("div");
      cell.className = "gm-cell";
      const val = grid[r][c];
      if (val !== -1) cell.style.background = GEM_COLORS[val];
      if (clearingSet && clearingSet.has(`${r},${c}`)) cell.classList.add("clearing");
      if (selected && selected.r === r && selected.c === c) cell.classList.add("selected");
      cell.addEventListener("click", () => {
        if (busy || over) return;
        if (!selected) {
          selected = { r, c };
          render();
          return;
        }
        if (selected.r === r && selected.c === c) {
          selected = null;
          render();
          return;
        }
        if (isAdjacent(selected, { r, c })) {
          const s = selected;
          selected = null;
          trySwap(s.r, s.c, r, c);
        } else {
          selected = { r, c };
          render();
        }
      });
      boardEl.appendChild(cell);
    }
  }
}

reset();
