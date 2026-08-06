const SIZE = 4;
const COLORS = {
  2: "#eef0fb", 4: "#dfe4ff", 8: "#ffb199", 16: "#ff9a5a",
  32: "#ff5d73", 64: "#ff3355", 128: "#ffd166", 256: "#ffc233",
  512: "#7ee8b5", 1024: "#5da9ff", 2048: "#c58bff"
};

const boardEl = document.getElementById("board");
let grid, score, best;

function emptyGrid() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

function cellsAvailable() {
  return grid.some((row) => row.includes(0));
}

function randomEmptyCell() {
  const empties = [];
  grid.forEach((row, r) => row.forEach((v, c) => { if (v === 0) empties.push([r, c]); }));
  return empties[Math.floor(Math.random() * empties.length)];
}

function addRandomTile() {
  if (!cellsAvailable()) return;
  const [r, c] = randomEmptyCell();
  grid[r][c] = Math.random() < 0.9 ? 2 : 4;
}

function reset() {
  grid = emptyGrid();
  score = 0;
  best = Number(localStorage.getItem("jogazone-2048-best") || 0);
  document.getElementById("score").textContent = score;
  document.getElementById("best").textContent = best;
  addRandomTile();
  addRandomTile();
  render();
}

function slideAndMerge(line) {
  const filtered = line.filter((v) => v !== 0);
  const result = [];
  let gained = 0;
  for (let i = 0; i < filtered.length; i++) {
    if (filtered[i] === filtered[i + 1]) {
      const merged = filtered[i] * 2;
      result.push(merged);
      gained += merged;
      i++;
    } else {
      result.push(filtered[i]);
    }
  }
  while (result.length < SIZE) result.push(0);
  return { result, gained };
}

function rotateGrid(g) {
  const newGrid = emptyGrid();
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      newGrid[c][SIZE - 1 - r] = g[r][c];
    }
  }
  return newGrid;
}

function move(direction) {
  let rotations = { left: 0, up: 1, right: 2, down: 3 }[direction];
  let working = grid;
  for (let i = 0; i < rotations; i++) working = rotateGrid(working);

  let moved = false;
  let gained = 0;
  const newRows = working.map((row) => {
    const { result, gained: g } = slideAndMerge(row);
    if (!moved && result.some((v, idx) => v !== row[idx])) moved = true;
    gained += g;
    return result;
  });

  let result = newRows;
  for (let i = 0; i < (4 - rotations) % 4; i++) result = rotateGrid(result);

  if (moved) {
    grid = result;
    score += gained;
    document.getElementById("score").textContent = score;
    if (score > best) {
      best = score;
      localStorage.setItem("jogazone-2048-best", String(best));
      document.getElementById("best").textContent = best;
    }
    addRandomTile();
    render();
    checkGameOver();
  }
}

function checkGameOver() {
  if (cellsAvailable()) return;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const v = grid[r][c];
      if ((c < SIZE - 1 && grid[r][c + 1] === v) || (r < SIZE - 1 && grid[r + 1][c] === v)) return;
    }
  }
  setTimeout(() => alert(`Fim de jogo! Pontuação: ${score}`), 50);
}

function render() {
  boardEl.innerHTML = "";
  for (let i = 0; i < SIZE * SIZE; i++) {
    const bg = document.createElement("div");
    bg.className = "cell-bg";
    boardEl.appendChild(bg);
  }

  const rect = boardEl.getBoundingClientRect();
  const padding = 10;
  const gap = 10;
  const cellSize = (rect.width - padding * 2 - gap * (SIZE - 1)) / SIZE;

  grid.forEach((row, r) => {
    row.forEach((v, c) => {
      if (v === 0) return;
      const tile = document.createElement("div");
      tile.className = "tile";
      tile.textContent = v;
      tile.style.width = cellSize + "px";
      tile.style.height = cellSize + "px";
      tile.style.left = padding + c * (cellSize + gap) + "px";
      tile.style.top = padding + r * (cellSize + gap) + "px";
      tile.style.background = COLORS[v] || "#c58bff";
      tile.style.fontSize = v >= 1024 ? "18px" : "26px";
      boardEl.appendChild(tile);
    });
  });
}

window.addEventListener("keydown", (e) => {
  const map = {
    ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down",
    a: "left", d: "right", w: "up", s: "down"
  };
  const dir = map[e.key];
  if (dir) {
    e.preventDefault();
    move(dir);
  }
});

let touchStart = null;
boardEl.addEventListener("touchstart", (e) => {
  touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
});
boardEl.addEventListener("touchend", (e) => {
  if (!touchStart) return;
  const dx = e.changedTouches[0].clientX - touchStart.x;
  const dy = e.changedTouches[0].clientY - touchStart.y;
  if (Math.abs(dx) > Math.abs(dy)) {
    move(dx > 0 ? "right" : "left");
  } else {
    move(dy > 0 ? "down" : "up");
  }
  touchStart = null;
});

document.getElementById("restart-btn").addEventListener("click", reset);

reset();
