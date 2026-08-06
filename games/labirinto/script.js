const SIZE = 15;
const CELL = 24;
const canvas = document.getElementById("canvas");
canvas.width = SIZE * CELL;
canvas.height = SIZE * CELL;
const ctx = canvas.getContext("2d");

let grid, player, moves, seconds, timerId, won;

function generateMaze() {
  const g = Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => ({ n: true, s: true, e: true, w: true, visited: false })));
  const stack = [[0, 0]];
  g[0][0].visited = true;
  while (stack.length) {
    const [x, y] = stack[stack.length - 1];
    const dirs = [];
    if (y > 0 && !g[y - 1][x].visited) dirs.push("n");
    if (y < SIZE - 1 && !g[y + 1][x].visited) dirs.push("s");
    if (x < SIZE - 1 && !g[y][x + 1].visited) dirs.push("e");
    if (x > 0 && !g[y][x - 1].visited) dirs.push("w");
    if (!dirs.length) { stack.pop(); continue; }
    const dir = dirs[Math.floor(Math.random() * dirs.length)];
    g[y][x][dir] = false;
    let nx = x, ny = y;
    if (dir === "n") { ny--; g[ny][nx].s = false; }
    if (dir === "s") { ny++; g[ny][nx].n = false; }
    if (dir === "e") { nx++; g[ny][nx].w = false; }
    if (dir === "w") { nx--; g[ny][nx].e = false; }
    g[ny][nx].visited = true;
    stack.push([nx, ny]);
  }
  return g;
}

function reset() {
  grid = generateMaze();
  player = { x: 0, y: 0 };
  moves = 0;
  seconds = 0;
  won = false;
  document.getElementById("moves").textContent = 0;
  document.getElementById("timer").textContent = "00:00";
  clearInterval(timerId);
  timerId = setInterval(() => {
    seconds++;
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    document.getElementById("timer").textContent = `${m}:${s}`;
  }, 1000);
  draw();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#10131f";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(126,232,181,.25)";
  ctx.fillRect(2, 2, CELL - 4, CELL - 4);
  ctx.fillStyle = "rgba(255,209,102,.25)";
  ctx.fillRect((SIZE - 1) * CELL + 2, (SIZE - 1) * CELL + 2, CELL - 4, CELL - 4);

  ctx.strokeStyle = "#5da9ff";
  ctx.lineWidth = 2;
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const cell = grid[y][x];
      const px = x * CELL, py = y * CELL;
      ctx.beginPath();
      if (cell.n) { ctx.moveTo(px, py); ctx.lineTo(px + CELL, py); }
      if (cell.w) { ctx.moveTo(px, py); ctx.lineTo(px, py + CELL); }
      if (y === SIZE - 1 && cell.s) { ctx.moveTo(px, py + CELL); ctx.lineTo(px + CELL, py + CELL); }
      if (x === SIZE - 1 && cell.e) { ctx.moveTo(px + CELL, py); ctx.lineTo(px + CELL, py + CELL); }
      ctx.stroke();
    }
  }

  ctx.fillStyle = "#ff5d73";
  ctx.beginPath();
  ctx.arc(player.x * CELL + CELL / 2, player.y * CELL + CELL / 2, CELL / 3, 0, Math.PI * 2);
  ctx.fill();
}

window.addEventListener("keydown", (e) => {
  if (won) return;
  const cell = grid[player.y][player.x];
  let moved = false;
  if (e.code === "ArrowUp" && !cell.n) { player.y--; moved = true; }
  else if (e.code === "ArrowDown" && !cell.s) { player.y++; moved = true; }
  else if (e.code === "ArrowLeft" && !cell.w) { player.x--; moved = true; }
  else if (e.code === "ArrowRight" && !cell.e) { player.x++; moved = true; }
  if (moved) {
    e.preventDefault();
    moves++;
    document.getElementById("moves").textContent = moves;
    draw();
    if (player.x === SIZE - 1 && player.y === SIZE - 1) {
      won = true;
      clearInterval(timerId);
      setTimeout(() => alert(`Chegaste! ${moves} movimentos, ${document.getElementById("timer").textContent}.`), 100);
    }
  }
});

document.getElementById("restart-btn").addEventListener("click", reset);
reset();
