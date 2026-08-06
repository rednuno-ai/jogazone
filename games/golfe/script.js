const W = 420, H = 340;
const canvas = document.getElementById("canvas");
canvas.width = W; canvas.height = H;
const ctx = canvas.getContext("2d");
const FRICTION = 0.985;
const BALL_R = 8;
const HOLE = { x: 360, y: 60, r: 14 };

const WALLS = [
  { x: 150, y: 0, w: 16, h: 230 },
  { x: 280, y: 110, w: 16, h: 230 }
];

let ball, dragging, dragPos, strokes, best, won;

function loadBest() {
  const saved = localStorage.getItem("jogazone-golfe-best");
  best = saved ? Number(saved) : null;
  document.getElementById("best").textContent = best ?? "—";
}

function reset() {
  ball = { x: 40, y: 280, vx: 0, vy: 0 };
  strokes = 0;
  won = false;
  document.getElementById("strokes").textContent = 0;
}

function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = W / rect.width, scaleY = H / rect.height;
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
}

function isMoving() { return Math.abs(ball.vx) > 0.05 || Math.abs(ball.vy) > 0.05; }

canvas.addEventListener("mousedown", (e) => {
  if (won || isMoving()) return;
  const pos = getPos(e);
  if (Math.hypot(pos.x - ball.x, pos.y - ball.y) < 40) { dragging = true; dragPos = pos; }
});
canvas.addEventListener("mousemove", (e) => { if (dragging) dragPos = getPos(e); });
window.addEventListener("mouseup", (e) => {
  if (!dragging) return;
  dragging = false;
  const pos = getPos(e);
  ball.vx = (ball.x - pos.x) * 0.14;
  ball.vy = (ball.y - pos.y) * 0.14;
  if (Math.hypot(ball.vx, ball.vy) > 0.3) {
    strokes++;
    document.getElementById("strokes").textContent = strokes;
  }
});

function collideWalls() {
  for (const w of WALLS) {
    const closestX = Math.max(w.x, Math.min(ball.x, w.x + w.w));
    const closestY = Math.max(w.y, Math.min(ball.y, w.y + w.h));
    const dx = ball.x - closestX, dy = ball.y - closestY;
    const dist = Math.hypot(dx, dy);
    if (dist < BALL_R) {
      if (Math.abs(dx) > Math.abs(dy)) ball.vx *= -1;
      else ball.vy *= -1;
      const overlap = BALL_R - dist || 1;
      ball.x += (dx / (dist || 1)) * overlap;
      ball.y += (dy / (dist || 1)) * overlap;
    }
  }
}

function update() {
  if (won) return;
  ball.x += ball.vx;
  ball.y += ball.vy;
  ball.vx *= FRICTION;
  ball.vy *= FRICTION;

  if (ball.x < BALL_R) { ball.x = BALL_R; ball.vx *= -1; }
  if (ball.x > W - BALL_R) { ball.x = W - BALL_R; ball.vx *= -1; }
  if (ball.y < BALL_R) { ball.y = BALL_R; ball.vy *= -1; }
  if (ball.y > H - BALL_R) { ball.y = H - BALL_R; ball.vy *= -1; }

  collideWalls();

  if (Math.hypot(ball.x - HOLE.x, ball.y - HOLE.y) < HOLE.r - 3 && !isMoving()) {
    won = true;
    if (!best || strokes < best) {
      best = strokes;
      localStorage.setItem("jogazone-golfe-best", String(best));
      document.getElementById("best").textContent = best;
    }
    setTimeout(() => alert(`Buraco em ${strokes} pancada${strokes === 1 ? "" : "s"}!`), 150);
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#163a24";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#0d2416";
  WALLS.forEach((w) => ctx.fillRect(w.x, w.y, w.w, w.h));

  ctx.fillStyle = "#0a0f08";
  ctx.beginPath();
  ctx.arc(HOLE.x, HOLE.y, HOLE.r, 0, Math.PI * 2);
  ctx.fill();

  if (dragging) {
    ctx.strokeStyle = "rgba(255,255,255,.5)";
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(ball.x, ball.y);
    ctx.lineTo(dragPos.x, dragPos.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.fillStyle = "#eef0fb";
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
  ctx.fill();
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

document.getElementById("restart-btn").addEventListener("click", reset);
loadBest();
reset();
loop();
