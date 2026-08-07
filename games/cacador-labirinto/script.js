const COLS = 17, ROWS = 15;
const CELL = 24;
const canvas = document.getElementById("canvas");
canvas.width = COLS * CELL;
canvas.height = ROWS * CELL;
const ctx = canvas.getContext("2d");

let grid, dots, powerUps, player, enemies, score, best, lives, poweredUntil, running, dotsTotal;

function generateMaze() {
  const g = Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => ({ n: true, s: true, e: true, w: true, visited: false })));
  const stack = [[0, 0]];
  g[0][0].visited = true;
  while (stack.length) {
    const [x, y] = stack[stack.length - 1];
    const dirs = [];
    if (y > 0 && !g[y - 1][x].visited) dirs.push("n");
    if (y < ROWS - 1 && !g[y + 1][x].visited) dirs.push("s");
    if (x < COLS - 1 && !g[y][x + 1].visited) dirs.push("e");
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
  // Adiciona ciclos extra para dar rotas de fuga
  for (let i = 0; i < (COLS * ROWS) / 6; i++) {
    const x = Math.floor(Math.random() * COLS), y = Math.floor(Math.random() * ROWS);
    const dir = ["n", "s", "e", "w"][Math.floor(Math.random() * 4)];
    if (dir === "e" && x < COLS - 1) { g[y][x].e = false; g[y][x + 1].w = false; }
    if (dir === "w" && x > 0) { g[y][x].w = false; g[y][x - 1].e = false; }
    if (dir === "s" && y < ROWS - 1) { g[y][x].s = false; g[y + 1][x].n = false; }
    if (dir === "n" && y > 0) { g[y][x].n = false; g[y - 1][x].s = false; }
  }
  return g;
}

function canMove(x, y, dir) {
  if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return false;
  return !grid[y][x][dir];
}

function loadBest() {
  best = Number(localStorage.getItem("jogazone-cacador-best") || 0);
  document.getElementById("best").textContent = best;
}

function reset() {
  grid = generateMaze();
  dots = new Set();
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) dots.add(x + "," + y);
  const corners = [[0, 0], [COLS - 1, 0], [0, ROWS - 1], [COLS - 1, ROWS - 1]];
  powerUps = new Set(corners.map(([x, y]) => x + "," + y));
  corners.forEach(([x, y]) => dots.delete(x + "," + y));
  dotsTotal = dots.size;

  player = { x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2), dir: "e" };
  enemies = [
    { x: 1, y: 1, color: "#ff5d73", name: "Vermelho" },
    { x: COLS - 2, y: 1, color: "#5da9ff", name: "Azul" },
    { x: Math.floor(COLS / 2), y: 1, color: "#c58bff", name: "Roxo" }
  ];
  score = 0;
  lives = 3;
  poweredUntil = 0;
  running = true;
  document.getElementById("score").textContent = 0;
  document.getElementById("lives").textContent = lives;
}

const keys = {};
window.addEventListener("keydown", (e) => {
  const m = { ArrowUp: "n", ArrowDown: "s", ArrowLeft: "w", ArrowRight: "e" };
  if (m[e.code]) { keys.next = m[e.code]; e.preventDefault(); }
});

function movePlayer() {
  if (keys.next && canMove(player.x, player.y, keys.next)) {
    player.dir = keys.next;
  }
  const dx = { n: 0, s: 0, e: 1, w: -1 }[player.dir];
  const dy = { n: -1, s: 1, e: 0, w: 0 }[player.dir];
  if (canMove(player.x, player.y, player.dir)) {
    player.x += dx;
    player.y += dy;
  }

  const key = player.x + "," + player.y;
  if (dots.has(key)) {
    dots.delete(key);
    score += 10;
    document.getElementById("score").textContent = score;
    if (dots.size === 0) winGame();
  }
  if (powerUps.has(key)) {
    powerUps.delete(key);
    poweredUntil = performance.now() + 6000;
    score += 50;
    document.getElementById("score").textContent = score;
  }
}

function moveEnemies() {
  const powered = performance.now() < poweredUntil;
  enemies.forEach((en) => {
    const dirs = ["n", "s", "e", "w"].filter((d) => canMove(en.x, en.y, d));
    if (!dirs.length) return;
    let best = dirs[0], bestDist = powered ? -1 : Infinity;
    dirs.forEach((d) => {
      const dx = { n: 0, s: 0, e: 1, w: -1 }[d];
      const dy = { n: -1, s: 1, e: 0, w: 0 }[d];
      const nx = en.x + dx, ny = en.y + dy;
      const dist = Math.abs(nx - player.x) + Math.abs(ny - player.y);
      if ((powered && dist > bestDist) || (!powered && dist < bestDist)) {
        bestDist = dist;
        best = d;
      }
    });
    if (Math.random() < 0.15) best = dirs[Math.floor(Math.random() * dirs.length)];
    const dx = { n: 0, s: 0, e: 1, w: -1 }[best];
    const dy = { n: -1, s: 1, e: 0, w: 0 }[best];
    en.x += dx; en.y += dy;
  });
}

function checkCollisions() {
  const powered = performance.now() < poweredUntil;
  enemies.forEach((en) => {
    if (en.x === player.x && en.y === player.y) {
      if (powered) {
        en.x = Math.floor(COLS / 2); en.y = 1;
        score += 100;
        document.getElementById("score").textContent = score;
      } else {
        loseLife();
      }
    }
  });
}

function loseLife() {
  lives--;
  document.getElementById("lives").textContent = lives;
  if (lives <= 0) {
    running = false;
    if (score > best) {
      best = score;
      localStorage.setItem("jogazone-cacador-best", String(best));
      document.getElementById("best").textContent = best;
    }
    setTimeout(() => alert(`Fim de jogo! Pontuação: ${score}`), 100);
  } else {
    player.x = Math.floor(COLS / 2);
    player.y = Math.floor(ROWS / 2);
  }
}

function winGame() {
  running = false;
  if (score > best) {
    best = score;
    localStorage.setItem("jogazone-cacador-best", String(best));
    document.getElementById("best").textContent = best;
  }
  setTimeout(() => alert(`Labirinto limpo! Pontuação: ${score}`), 100);
}

let lastTick = 0;
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#0a0a1a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#2a2f8a";
  ctx.lineWidth = 2;
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const c = grid[y][x];
      const px = x * CELL, py = y * CELL;
      ctx.beginPath();
      if (c.n) { ctx.moveTo(px, py); ctx.lineTo(px + CELL, py); }
      if (c.w) { ctx.moveTo(px, py); ctx.lineTo(px, py + CELL); }
      if (y === ROWS - 1 && c.s) { ctx.moveTo(px, py + CELL); ctx.lineTo(px + CELL, py + CELL); }
      if (x === COLS - 1 && c.e) { ctx.moveTo(px + CELL, py); ctx.lineTo(px + CELL, py + CELL); }
      ctx.stroke();
    }
  }

  ctx.fillStyle = "#ffd166";
  dots.forEach((key) => {
    const [x, y] = key.split(",").map(Number);
    ctx.beginPath();
    ctx.arc(x * CELL + CELL / 2, y * CELL + CELL / 2, 2.5, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = "#ffd166";
  powerUps.forEach((key) => {
    const [x, y] = key.split(",").map(Number);
    ctx.beginPath();
    ctx.arc(x * CELL + CELL / 2, y * CELL + CELL / 2, 6, 0, Math.PI * 2);
    ctx.fill();
  });

  const powered = performance.now() < poweredUntil;
  enemies.forEach((en) => {
    ctx.fillStyle = powered ? "#5da9ff" : en.color;
    ctx.beginPath();
    ctx.arc(en.x * CELL + CELL / 2, en.y * CELL + CELL / 2, CELL / 2.6, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = "#7ee8b5";
  ctx.beginPath();
  ctx.arc(player.x * CELL + CELL / 2, player.y * CELL + CELL / 2, CELL / 2.6, 0, Math.PI * 2);
  ctx.fill();
}

function tick(now) {
  if (running && now - lastTick > 150) {
    movePlayer();
    moveEnemies();
    checkCollisions();
    lastTick = now;
  }
  draw();
  requestAnimationFrame(tick);
}

loadBest();
reset();
requestAnimationFrame(tick);
