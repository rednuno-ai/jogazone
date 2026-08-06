const GRID = 6;
const CELL = 50;
const EXIT_ROW = 2;

const LEVELS = [
  [
    { id: "target", x: 0, y: EXIT_ROW, w: 2, h: 1, horizontal: true, color: "#ff5d73", icon: "🚛" },
    { x: 2, y: 0, w: 1, h: 3, horizontal: false, color: "#5da9ff", icon: "🚗" },
    { x: 3, y: 0, w: 2, h: 1, horizontal: true, color: "#ffd166", icon: "🚙" },
    { x: 0, y: 3, w: 1, h: 2, horizontal: false, color: "#7ee8b5", icon: "🚕" },
    { x: 2, y: 4, w: 3, h: 1, horizontal: true, color: "#c58bff", icon: "🚐" },
    { x: 4, y: 1, w: 1, h: 2, horizontal: false, color: "#ff9a5a", icon: "🚓" }
  ],
  [
    { id: "target", x: 0, y: EXIT_ROW, w: 2, h: 1, horizontal: true, color: "#ff5d73", icon: "🚛" },
    { x: 2, y: 0, w: 1, h: 2, horizontal: false, color: "#5da9ff", icon: "🚗" },
    { x: 3, y: 0, w: 1, h: 3, horizontal: false, color: "#ffd166", icon: "🚙" },
    { x: 4, y: 2, w: 2, h: 1, horizontal: true, color: "#7ee8b5", icon: "🚕" },
    { x: 0, y: 3, w: 2, h: 1, horizontal: true, color: "#c58bff", icon: "🚐" },
    { x: 1, y: 4, w: 3, h: 1, horizontal: true, color: "#ff9a5a", icon: "🚓" },
    { x: 5, y: 0, w: 1, h: 2, horizontal: false, color: "#ffb199", icon: "🚌" }
  ]
];

let levelIndex, blocks, selected, moves;

function loadLevel(idx) {
  levelIndex = idx % LEVELS.length;
  blocks = LEVELS[levelIndex].map((b) => ({ ...b }));
  selected = null;
  moves = 0;
  document.getElementById("level").textContent = levelIndex + 1;
  document.getElementById("moves").textContent = 0;
  render();
}

function occupiedCells(exclude) {
  const set = new Set();
  blocks.forEach((b) => {
    if (b === exclude) return;
    for (let i = 0; i < b.w; i++)
      for (let j = 0; j < b.h; j++)
        set.add((b.x + i) + "," + (b.y + j));
  });
  return set;
}

function canMoveTo(block, newX, newY) {
  if (newX < 0 || newY < 0 || newX + block.w > GRID || newY + block.h > GRID) return false;
  const occ = occupiedCells(block);
  for (let i = 0; i < block.w; i++)
    for (let j = 0; j < block.h; j++)
      if (occ.has((newX + i) + "," + (newY + j))) return false;
  return true;
}

function render() {
  const board = document.getElementById("board");
  board.innerHTML = `<div class="jam-exit" style="top:${EXIT_ROW * CELL}px"></div>`;
  blocks.forEach((b) => {
    const el = document.createElement("div");
    el.className = "jam-block" + (b === selected ? " selected" : "");
    el.style.left = b.x * CELL + 2 + "px";
    el.style.top = b.y * CELL + 2 + "px";
    el.style.width = b.w * CELL - 4 + "px";
    el.style.height = b.h * CELL - 4 + "px";
    el.style.background = b.color;
    el.textContent = b.icon;
    el.addEventListener("click", () => onBlockClick(b));
    board.appendChild(el);
  });
}

function onBlockClick(b) {
  selected = selected === b ? null : b;
  render();
}

document.getElementById("board").addEventListener("click", (e) => {
  if (!selected || e.target !== document.getElementById("board")) return;
  const rect = e.currentTarget.getBoundingClientRect();
  const cx = Math.floor((e.clientX - rect.left) / CELL);
  const cy = Math.floor((e.clientY - rect.top) / CELL);
  attemptMove(cx, cy);
});

function attemptMove(cx, cy) {
  const b = selected;
  if (!b) return;
  let newX = b.x, newY = b.y;
  if (b.horizontal) newX = cx;
  else newY = cy;

  const step = b.horizontal ? Math.sign(newX - b.x) : Math.sign(newY - b.y);
  if (step === 0) return;

  let moved = false;
  while (b.horizontal ? b.x !== newX : b.y !== newY) {
    const tryX = b.horizontal ? b.x + step : b.x;
    const tryY = b.horizontal ? b.y : b.y + step;
    if (!canMoveTo(b, tryX, tryY)) break;
    b.x = tryX; b.y = tryY;
    moved = true;
  }

  if (moved) {
    moves++;
    document.getElementById("moves").textContent = moves;
    render();
    checkWin();
  }
}

function checkWin() {
  const target = blocks.find((b) => b.id === "target");
  if (target.x + target.w >= GRID) {
    setTimeout(() => {
      alert(`Livre! Resolvido em ${moves} movimentos.`);
      loadLevel(levelIndex + 1);
    }, 150);
  }
}

document.getElementById("restart-btn").addEventListener("click", () => loadLevel(levelIndex));
loadLevel(0);
