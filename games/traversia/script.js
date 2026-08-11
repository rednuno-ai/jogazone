const TILE = 40;
const COLS = 12;
const ROWS = 11; // 0 = goal, 1-4 river, 5 median, 6-9 road, 10 = start
const W = COLS * TILE, H = ROWS * TILE;

const canvas = document.getElementById("canvas");
canvas.width = W; canvas.height = H;
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const livesEl = document.getElementById("lives");

const ROW_TYPES = ["goal", "river", "river", "river", "river", "median", "road", "road", "road", "road", "start"];

let player, lanes, score, best, lives, over, onLog;

function reset() {
  player = { row: 10, col: Math.floor(COLS / 2), x: 0 };
  player.x = player.col * TILE;
  score = 0;
  best = parseInt(localStorage.getItem("jogazone-traversia-best") || "0", 10);
  lives = 3;
  over = false;
  onLog = null;
  scoreEl.textContent = 0;
  bestEl.textContent = best;
  livesEl.textContent = lives;
  buildLanes();
}

function buildLanes() {
  lanes = {};
  ROW_TYPES.forEach((type, row) => {
    if (type === "road") {
      const dir = row % 2 === 0 ? 1 : -1;
      const speed = (40 + row * 8) * dir;
      const gap = 220;
      const entities = [];
      for (let i = 0; i < 4; i++) {
        entities.push({ x: i * gap + Math.random() * 60, w: 46 });
      }
      lanes[row] = { speed, entities, w: 46 };
    } else if (type === "river") {
      const dir = row % 2 === 0 ? -1 : 1;
      const speed = (30 + row * 6) * dir;
      const gap = 180;
      const entities = [];
      for (let i = 0; i < 4; i++) {
        entities.push({ x: i * gap + Math.random() * 60, w: 90 });
      }
      lanes[row] = { speed, entities, w: 90 };
    }
  });
}

function resetPlayer(keepScore) {
  player.row = 10;
  player.col = Math.floor(COLS / 2);
  player.x = player.col * TILE;
  if (!keepScore) {
    // no-op, score persists across lives
  }
}

window.addEventListener("keydown", (e) => {
  if (over) return;
  let moved = false;
  if (e.code === "ArrowUp") { player.row = Math.max(0, player.row - 1); moved = true; }
  else if (e.code === "ArrowDown") { player.row = Math.min(ROWS - 1, player.row + 1); moved = true; }
  else if (e.code === "ArrowLeft") { player.col = Math.max(0, player.col - 1); moved = true; }
  else if (e.code === "ArrowRight") { player.col = Math.min(COLS - 1, player.col + 1); moved = true; }
  if (moved) {
    e.preventDefault();
    player.x = player.col * TILE;
    if (player.row === 0) {
      score += 50;
      scoreEl.textContent = score;
      if (score > best) {
        best = score;
        bestEl.textContent = best;
        localStorage.setItem("jogazone-traversia-best", String(best));
      }
      resetPlayer();
    }
  }
});

function update(dt) {
  if (over) return;

  Object.entries(lanes).forEach(([row, lane]) => {
    lane.entities.forEach((ent) => {
      ent.x += lane.speed * dt;
      if (lane.speed > 0 && ent.x > W + 40) ent.x = -ent.w - Math.random() * 100;
      if (lane.speed < 0 && ent.x < -ent.w - 40) ent.x = W + Math.random() * 100;
    });
  });

  const type = ROW_TYPES[player.row];
  const lane = lanes[player.row];

  if (type === "road" && lane) {
    for (const ent of lane.entities) {
      if (player.x < ent.x + ent.w && player.x + TILE > ent.x) {
        loseLife();
        return;
      }
    }
  }

  if (type === "river" && lane) {
    let standing = null;
    for (const ent of lane.entities) {
      if (player.x + TILE / 2 > ent.x && player.x + TILE / 2 < ent.x + ent.w) {
        standing = ent;
        break;
      }
    }
    if (!standing) {
      loseLife();
      return;
    }
    player.x += lane.speed * dt;
    player.col = Math.round(player.x / TILE);
    if (player.x < 0 || player.x > W - TILE) {
      loseLife();
      return;
    }
  }
}

function loseLife() {
  lives--;
  livesEl.textContent = lives;
  if (lives <= 0) {
    over = true;
  } else {
    resetPlayer();
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ROW_TYPES.forEach((type, row) => {
    const y = row * TILE;
    if (type === "goal") ctx.fillStyle = "#2d5a3a";
    else if (type === "river") ctx.fillStyle = "#1a4a7a";
    else if (type === "median") ctx.fillStyle = "#2d5a3a";
    else if (type === "road") ctx.fillStyle = "#2a2a2a";
    else ctx.fillStyle = "#2d5a3a";
    ctx.fillRect(0, y, W, TILE);
  });

  Object.entries(lanes).forEach(([row, lane]) => {
    const y = row * TILE;
    const type = ROW_TYPES[row];
    ctx.fillStyle = type === "road" ? "#e8b878" : "#8a5a3a";
    lane.entities.forEach((ent) => {
      ctx.fillRect(ent.x, y + 6, ent.w, TILE - 12);
    });
  });

  ctx.fillStyle = "#ffd166";
  ctx.beginPath();
  ctx.arc(player.x + TILE / 2, player.row * TILE + TILE / 2, TILE / 2 - 6, 0, Math.PI * 2);
  ctx.fill();

  if (over) {
    ctx.fillStyle = "rgba(20,24,40,.85)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#eef0fb";
    ctx.font = "bold 22px 'Segoe UI'";
    ctx.textAlign = "center";
    ctx.fillText(`Fim de jogo! ${score} pontos`, W / 2, H / 2 - 10);
    ctx.font = "14px 'Segoe UI'";
    ctx.fillText("Recarrega a página para jogares de novo", W / 2, H / 2 + 18);
  }
}

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

reset();
requestAnimationFrame(loop);
