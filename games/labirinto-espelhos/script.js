const SIZE = 8;
const gridEl = document.getElementById("grid");
const statusEl = document.getElementById("status");
const levelEl = document.getElementById("level");
const newBtn = document.getElementById("new-btn");

const DIRS = {
  right: [1, 0],
  left: [-1, 0],
  up: [0, -1],
  down: [0, 1],
};

const MIRROR_SLASH = {
  right: "up", up: "right",
  left: "down", down: "left",
};
const MIRROR_BACKSLASH = {
  right: "down", down: "right",
  left: "up", up: "left",
};

let cells, source, target, level, solved;

function randomEdgeCell() {
  const side = Math.floor(Math.random() * 4);
  if (side === 0) return { r: 0, c: Math.floor(Math.random() * SIZE), dir: "down" };
  if (side === 1) return { r: SIZE - 1, c: Math.floor(Math.random() * SIZE), dir: "up" };
  if (side === 2) return { r: Math.floor(Math.random() * SIZE), c: 0, dir: "right" };
  return { r: Math.floor(Math.random() * SIZE), c: SIZE - 1, dir: "left" };
}

function reset(nextLevel) {
  cells = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  source = randomEdgeCell();
  do {
    target = { r: Math.floor(Math.random() * SIZE), c: Math.floor(Math.random() * SIZE) };
  } while (target.r === source.r && target.c === source.c);
  level = nextLevel || 1;
  solved = false;
  levelEl.textContent = level;
  statusEl.textContent = "Encaminha o laser até ao alvo";
  render();
}

function simulate() {
  let [dx, dy] = DIRS[source.dir];
  let r = source.r + dy, c = source.c + dx;
  const path = [];
  let dir = source.dir;
  let steps = 0;
  const maxSteps = SIZE * SIZE * 2;

  while (r >= 0 && r < SIZE && c >= 0 && c < SIZE && steps < maxSteps) {
    path.push({ r, c });
    if (r === target.r && c === target.c) {
      return { path, hit: true };
    }
    if (cells[r][c] === 1) dir = MIRROR_SLASH[dir];
    else if (cells[r][c] === 2) dir = MIRROR_BACKSLASH[dir];
    const [ndx, ndy] = DIRS[dir];
    r += ndy;
    c += ndx;
    steps++;
  }
  return { path, hit: false };
}

function render() {
  const { path, hit } = simulate();
  const litSet = new Set(path.map((p) => `${p.r},${p.c}`));
  solved = hit;

  gridEl.innerHTML = "";
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const cell = document.createElement("div");
      cell.className = "le-cell";
      if (r === source.r && c === source.c) cell.classList.add("source");
      else if (r === target.r && c === target.c) cell.classList.add(hit ? "hit" : "target");
      else if (litSet.has(`${r},${c}`)) cell.classList.add("lit");

      if (cells[r][c] === 1) cell.textContent = "/";
      else if (cells[r][c] === 2) cell.textContent = "\\";

      if (!(r === source.r && c === source.c) && !(r === target.r && c === target.c)) {
        cell.addEventListener("click", () => {
          cells[r][c] = (cells[r][c] + 1) % 3;
          render();
        });
      }
      gridEl.appendChild(cell);
    }
  }

  if (hit) {
    statusEl.textContent = "Acertaste no alvo! 🎉 A gerar o próximo nível...";
    setTimeout(() => reset(level + 1), 1200);
  } else {
    statusEl.textContent = "Encaminha o laser até ao alvo";
  }
}

newBtn.addEventListener("click", () => reset(1));

reset(1);
