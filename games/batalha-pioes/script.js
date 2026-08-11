const W = 400, H = 400;
const canvas = document.getElementById("canvas");
canvas.width = W; canvas.height = H;
const ctx = canvas.getContext("2d");

const winsEl = document.getElementById("wins");
const lossesEl = document.getElementById("losses");

const ARENA = { x: W / 2, y: H / 2, r: 170 };
const TOP_R = 20;
const ACCEL = 500;
const FRICTION = 1.6;
const CPU_ACCEL = 380;

let player, cpu, keys, wins, losses, over;

function reset() {
  player = { x: ARENA.x - 60, y: ARENA.y, vx: 0, vy: 0 };
  cpu = { x: ARENA.x + 60, y: ARENA.y, vx: 0, vy: 0 };
  keys = {};
  wins = parseInt(localStorage.getItem("jogazone-batalha-pioes-wins") || "0", 10);
  losses = parseInt(localStorage.getItem("jogazone-batalha-pioes-losses") || "0", 10);
  over = false;
  winsEl.textContent = wins;
  lossesEl.textContent = losses;
}

window.addEventListener("keydown", (e) => {
  keys[e.code] = true;
  if (e.code.startsWith("Arrow")) e.preventDefault();
});
window.addEventListener("keyup", (e) => { keys[e.code] = false; });

function isOutside(top) {
  return Math.hypot(top.x - ARENA.x, top.y - ARENA.y) > ARENA.r;
}

function resolveCollision(a, b) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const dist = Math.hypot(dx, dy);
  if (dist < TOP_R * 2 && dist > 0.001) {
    const nx = dx / dist, ny = dy / dist;
    const overlap = TOP_R * 2 - dist;
    a.x -= nx * overlap / 2;
    a.y -= ny * overlap / 2;
    b.x += nx * overlap / 2;
    b.y += ny * overlap / 2;

    const relVx = b.vx - a.vx, relVy = b.vy - a.vy;
    const relSpeed = relVx * nx + relVy * ny;
    if (relSpeed < 0) {
      const impulse = -relSpeed;
      a.vx -= nx * impulse;
      a.vy -= ny * impulse;
      b.vx += nx * impulse;
      b.vy += ny * impulse;
    }
  }
}

function update(dt) {
  if (over) return;

  let ax = 0, ay = 0;
  if (keys["ArrowLeft"]) ax -= ACCEL;
  if (keys["ArrowRight"]) ax += ACCEL;
  if (keys["ArrowUp"]) ay -= ACCEL;
  if (keys["ArrowDown"]) ay += ACCEL;
  player.vx += ax * dt;
  player.vy += ay * dt;

  const dx = player.x - cpu.x, dy = player.y - cpu.y;
  const dist = Math.hypot(dx, dy) || 1;
  cpu.vx += (dx / dist) * CPU_ACCEL * dt;
  cpu.vy += (dy / dist) * CPU_ACCEL * dt;

  [player, cpu].forEach((top) => {
    top.vx *= Math.max(0, 1 - FRICTION * dt);
    top.vy *= Math.max(0, 1 - FRICTION * dt);
    top.x += top.vx * dt;
    top.y += top.vy * dt;
  });

  resolveCollision(player, cpu);

  if (isOutside(player)) {
    over = true;
    losses++;
    lossesEl.textContent = losses;
    localStorage.setItem("jogazone-batalha-pioes-losses", String(losses));
  } else if (isOutside(cpu)) {
    over = true;
    wins++;
    winsEl.textContent = wins;
    localStorage.setItem("jogazone-batalha-pioes-wins", String(wins));
  }

  if (over) setTimeout(reset, 1500);
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#3a2a1a";
  ctx.beginPath();
  ctx.arc(ARENA.x, ARENA.y, ARENA.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#ffd166";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = "#5da9ff";
  ctx.beginPath();
  ctx.arc(player.x, player.y, TOP_R, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ff5d73";
  ctx.beginPath();
  ctx.arc(cpu.x, cpu.y, TOP_R, 0, Math.PI * 2);
  ctx.fill();

  if (over) {
    ctx.fillStyle = "rgba(20,24,40,.7)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#eef0fb";
    ctx.font = "bold 20px 'Segoe UI'";
    ctx.textAlign = "center";
    const msg = isOutside(player) ? "Perdeste!" : "Venceste! 🎉";
    ctx.fillText(msg, W / 2, H / 2);
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
