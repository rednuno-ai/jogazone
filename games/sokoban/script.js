const LEVELS = [
  [
    "#####",
    "#.  #",
    "# $ #",
    "#  @#",
    "#####"
  ],
  [
    "#######",
    "#  .  #",
    "# $ $ #",
    "#  @  #",
    "#  .  #",
    "#######"
  ]
];

let levelIdx, cells, walls, targets, boxes, player, moves;

function parseLevel(idx) {
  const rows = LEVELS[idx];
  walls = new Set();
  targets = new Set();
  boxes = new Set();
  const h = rows.length, w = Math.max(...rows.map((r) => r.length));
  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      const ch = rows[r][c] || " ";
      if (ch === "#") walls.add(r + "," + c);
      if (ch === "." ) targets.add(r + "," + c);
      if (ch === "$") boxes.add(r + "," + c);
      if (ch === "@") player = { r, c };
    }
  }
  return { h, w };
}

function loadLevel(idx) {
  levelIdx = idx % LEVELS.length;
  const { h, w } = parseLevel(levelIdx);
  moves = 0;
  document.getElementById("level").textContent = levelIdx + 1;
  document.getElementById("moves").textContent = 0;
  const board = document.getElementById("board");
  board.style.gridTemplateColumns = `repeat(${w}, 36px)`;
  board.style.gridTemplateRows = `repeat(${h}, 36px)`;
  window._dims = { h, w };
  render();
}

function render() {
  const { h, w } = window._dims;
  const board = document.getElementById("board");
  board.innerHTML = "";
  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      const key = r + "," + c;
      const cell = document.createElement("div");
      let cls = "soko-cell ";
      let content = "";
      if (walls.has(key)) cls += "wall";
      else {
        cls += targets.has(key) ? "target" : "floor";
        if (boxes.has(key)) content = targets.has(key) ? "✅" : "📦";
        else if (player.r === r && player.c === c) content = "🧑";
      }
      cell.className = cls;
      cell.textContent = content;
      board.appendChild(cell);
    }
  }
}

function checkWin() {
  for (const t of targets) if (!boxes.has(t)) return false;
  return true;
}

window.addEventListener("keydown", (e) => {
  const map = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
  const d = map[e.code];
  if (!d) return;
  e.preventDefault();
  const [dr, dc] = d;
  const nr = player.r + dr, nc = player.c + dc;
  const nkey = nr + "," + nc;
  if (walls.has(nkey)) return;

  if (boxes.has(nkey)) {
    const br = nr + dr, bc = nc + dc;
    const bkey = br + "," + bc;
    if (walls.has(bkey) || boxes.has(bkey)) return;
    boxes.delete(nkey);
    boxes.add(bkey);
  }

  player = { r: nr, c: nc };
  moves++;
  document.getElementById("moves").textContent = moves;
  render();

  if (checkWin()) {
    setTimeout(() => {
      alert(`Nível ${levelIdx + 1} resolvido em ${moves} movimentos!`);
      loadLevel(levelIdx + 1);
    }, 150);
  }
});

document.getElementById("restart-btn").addEventListener("click", () => loadLevel(levelIdx));
loadLevel(0);
