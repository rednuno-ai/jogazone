const W = 400, H = 400;
const canvas = document.getElementById("canvas");
canvas.width = W; canvas.height = H;
const ctx = canvas.getContext("2d");

const levelEl = document.getElementById("level");
const fallsEl = document.getElementById("falls");

const START = { x: 30, y: 30 };
const GOAL = { x: 370, y: 370, r: 16 };
const BALL_R = 8;
const ACCEL = 420;
const FRICTION = 3.2;

const WALLS = [
  { x: 0, y: 120, w: 260, h: 14 },
  { x: 140, y: 200, w: 260, h: 14 },
  { x: 0, y: 280, w: 260, h: 14 },
];

const HOLES = [
  { x: 200, y: 80, r: 16 },
  { x: 90, y: 240, r: 16 },
  { x: 320, y: 160, r: 16 },
];

let ball, keys, level, falls, won;

function reset(nextLevel) {
  ball = { x: START.x, y: START.y, vx: 0, vy: 0 };
  keys = {};
  level = nextLevel || 1;
  falls = falls || 0;
  won = false;
  levelEl.textContent = level;
  fallsEl.textContent = falls;
}

window.addEventListener("keydown", (e) => {
  keys[e.code] = true;
  if (e.code.startsWith("Arrow")) e.preventDefault();
});
window.addEventListener("keyup", (e) => { keys[e.code] = false; });

function circleRectPush(ball, rect) {
  const closestX = Math.max(rect.x, Math.min(ball.x, rect.x + rect.w));
  const closestY = Math.max(rect.y, Math.min(ball.y, rect.y + rect.h));
  const dx = ball.x - closestX;
  const dy = ball.y - closestY;
  const dist = Math.hypot(dx, dy);
  if (dist < BALL_R && dist > 0.0001) {
    const nx = dx / dist, ny = dy / dist;
    const overlap = BALL_R - dist;
    ball.x += nx * overlap;
    ball.y += ny * overlap;
    const vn = ball.vx * nx + ball.vy * ny;
    if (vn < 0) {
      ball.vx -= vn * nx;
      ball.vy -= vn * ny;
    }
  } else if (dist <= 0.0001) {
    ball.y -= BALL_R;
    ball.vy = 0;
  }
}

function update(dt) {
  if (won) return;

  let ax = 0, ay = 0;
  if (keys["ArrowLeft"]) ax -= ACCEL;
  if (keys["ArrowRight"]) ax += ACCEL;
  if (keys["ArrowUp"]) ay -= ACCEL;
  if (keys["ArrowDown"]) ay += ACCEL;

  ball.vx += ax * dt;
  ball.vy += ay * dt;
  ball.vx *= Math.max(0, 1 - FRICTION * dt);
  ball.vy *= Math.max(0, 1 - FRICTION * dt);

  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  if (ball.x - BALL_R < 0) { ball.x = BALL_R; ball.vx = 0; }
  if (ball.x + BALL_R > W) { ball.x = W - BALL_R; ball.vx = 0; }
  if (ball.y - BALL_R < 0) { ball.y = BALL_R; ball.vy = 0; }
  if (ball.y + BALL_R > H) { ball.y = H - BALL_R; ball.vy = 0; }

  WALLS.forEach((wall) => circleRectPush(ball, wall));

  for (const hole of HOLES) {
    if (Math.hypot(ball.x - hole.x, ball.y - hole.y) < hole.r - 3) {
      falls++;
      fallsEl.textContent = falls;
      ball.x = START.x; ball.y = START.y; ball.vx = 0; ball.vy = 0;
      return;
    }
  }

  if (Math.hypot(ball.x - GOAL.x, ball.y - GOAL.y) < GOAL.r) {
    won = true;
    setTimeout(() => reset(level + 1), 1000);
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#4caf6d";
  ctx.beginPath();
  ctx.arc(GOAL.x, GOAL.y, GOAL.r, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#0a0a12";
  HOLES.forEach((h) => {
    ctx.beginPath();
    ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = "#5a5a7a";
  WALLS.forEach((w) => ctx.fillRect(w.x, w.y, w.w, w.h));

  ctx.fillStyle = "#ffd166";
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
  ctx.fill();

  if (won) {
    ctx.fillStyle = "rgba(20,24,40,.7)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#eef0fb";
    ctx.font = "bold 20px 'Segoe UI'";
    ctx.textAlign = "center";
    ctx.fillText("Chegaste à saída! 🎉", W / 2, H / 2);
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

reset(1);
requestAnimationFrame(loop);
