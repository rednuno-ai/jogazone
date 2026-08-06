const W = 480, H = 260;
const canvas = document.getElementById("canvas");
canvas.width = W; canvas.height = H;
const ctx = canvas.getContext("2d");

const BALL_R = 7;
const FRICTION = 0.985;
const POCKET_R = 13;
const MARGIN = 14;

const POCKETS = [
  { x: MARGIN, y: MARGIN }, { x: W / 2, y: MARGIN - 4 }, { x: W - MARGIN, y: MARGIN },
  { x: MARGIN, y: H - MARGIN }, { x: W / 2, y: H - MARGIN + 4 }, { x: W - MARGIN, y: H - MARGIN }
];

const COLORS = ["#ffd166", "#5da9ff", "#ff5d73", "#7ee8b5", "#c58bff", "#ff9a5a", "#eef0fb", "#8a5a2a", "#e879b9"];

let balls, cue, dragging, dragPos, shots, best, over;

function loadBest() {
  const saved = localStorage.getItem("jogazone-sinuca-best");
  best = saved ? Number(saved) : null;
  document.getElementById("best").textContent = best ?? "—";
}

function rack() {
  const balls = [];
  const startX = W * 0.72, startY = H / 2;
  let idx = 0;
  for (let row = 0; row < 4; row++) {
    for (let i = 0; i <= row; i++) {
      if (idx >= 9) break;
      const x = startX + row * (BALL_R * 1.8);
      const y = startY - row * BALL_R + i * BALL_R * 2;
      balls.push({ x, y, vx: 0, vy: 0, color: COLORS[idx], alive: true });
      idx++;
    }
  }
  return balls;
}

function reset() {
  balls = rack();
  cue = { x: W * 0.2, y: H / 2, vx: 0, vy: 0 };
  shots = 0;
  over = false;
  document.getElementById("shots").textContent = 0;
  document.getElementById("remaining").textContent = balls.length;
}

function allStopped() {
  const slow = (b) => Math.hypot(b.vx, b.vy) < 0.05;
  return slow(cue) && balls.every(slow);
}

function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = W / rect.width, scaleY = H / rect.height;
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
}

canvas.addEventListener("mousedown", (e) => {
  if (over || !allStopped()) return;
  const pos = getPos(e);
  if (Math.hypot(pos.x - cue.x, pos.y - cue.y) < 40) { dragging = true; dragPos = pos; }
});
canvas.addEventListener("mousemove", (e) => { if (dragging) dragPos = getPos(e); });
window.addEventListener("mouseup", (e) => {
  if (!dragging) return;
  dragging = false;
  const pos = getPos(e);
  const dx = cue.x - pos.x, dy = cue.y - pos.y;
  const power = Math.min(Math.hypot(dx, dy), 90);
  if (power > 6) {
    cue.vx = (dx / Math.hypot(dx, dy)) * power * 0.16;
    cue.vy = (dy / Math.hypot(dx, dy)) * power * 0.16;
    shots++;
    document.getElementById("shots").textContent = shots;
  }
});

function ballWallCollide(b) {
  if (b.x - BALL_R < MARGIN) { b.x = MARGIN + BALL_R; b.vx *= -1; }
  if (b.x + BALL_R > W - MARGIN) { b.x = W - MARGIN - BALL_R; b.vx *= -1; }
  if (b.y - BALL_R < MARGIN) { b.y = MARGIN + BALL_R; b.vy *= -1; }
  if (b.y + BALL_R > H - MARGIN) { b.y = H - MARGIN - BALL_R; b.vy *= -1; }
}

function ballBallCollide(a, b) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const dist = Math.hypot(dx, dy);
  if (dist === 0 || dist > BALL_R * 2) return;
  const nx = dx / dist, ny = dy / dist;
  const overlap = BALL_R * 2 - dist;
  a.x -= nx * overlap / 2; a.y -= ny * overlap / 2;
  b.x += nx * overlap / 2; b.y += ny * overlap / 2;

  const relVx = a.vx - b.vx, relVy = a.vy - b.vy;
  const speed = relVx * nx + relVy * ny;
  if (speed <= 0) return;
  a.vx -= speed * nx; a.vy -= speed * ny;
  b.vx += speed * nx; b.vy += speed * ny;
}

function checkPocket(b) {
  for (const p of POCKETS) {
    if (Math.hypot(b.x - p.x, b.y - p.y) < POCKET_R) return true;
  }
  return false;
}

function update() {
  if (over) return;
  const all = [cue, ...balls.filter((b) => b.alive)];
  all.forEach((b) => {
    b.x += b.vx; b.y += b.vy;
    b.vx *= FRICTION; b.vy *= FRICTION;
    ballWallCollide(b);
  });

  for (let i = 0; i < all.length; i++)
    for (let j = i + 1; j < all.length; j++)
      ballBallCollide(all[i], all[j]);

  balls.forEach((b) => {
    if (b.alive && checkPocket(b)) {
      b.alive = false;
      const remaining = balls.filter((bb) => bb.alive).length;
      document.getElementById("remaining").textContent = remaining;
      if (remaining === 0) {
        over = true;
        if (!best || shots < best) {
          best = shots;
          localStorage.setItem("jogazone-sinuca-best", String(best));
          document.getElementById("best").textContent = best;
        }
        setTimeout(() => alert(`Mesa limpa em ${shots} tacadas!`), 150);
      }
    }
  });

  if (checkPocket(cue)) {
    cue.x = W * 0.2; cue.y = H / 2; cue.vx = 0; cue.vy = 0;
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#0b3d24";
  ctx.fillRect(0, 0, W, H);

  POCKETS.forEach((p) => {
    ctx.fillStyle = "#0a0a0a";
    ctx.beginPath();
    ctx.arc(p.x, p.y, POCKET_R, 0, Math.PI * 2);
    ctx.fill();
  });

  if (dragging) {
    ctx.strokeStyle = "rgba(255,255,255,.5)";
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(cue.x, cue.y);
    ctx.lineTo(dragPos.x, dragPos.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  balls.forEach((b) => {
    if (!b.alive) return;
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.arc(b.x, b.y, BALL_R, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = "#eef0fb";
  ctx.beginPath();
  ctx.arc(cue.x, cue.y, BALL_R, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#0b3d24";
  ctx.lineWidth = 1;
  ctx.stroke();
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loadBest();
reset();
loop();
