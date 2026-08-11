const W = 300, H = 560;
const canvas = document.getElementById("canvas");
canvas.width = W; canvas.height = H;
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const throwsEl = document.getElementById("throws");
const bestEl = document.getElementById("best");

const HOUSE = { x: 150, y: 80 };
const RINGS = [{ r: 14, pts: 3 }, { r: 34, pts: 2 }, { r: 55, pts: 1 }];
const STONE_START = { x: 150, y: 500 };
const STONE_R = 12;
const FRICTION = 55;
const MAX_DRAG = 110;
const POWER_SCALE = 3.2;

let stone, vel, sliding, score, throwsLeft, best, over, drag;

function reset() {
  stone = { x: STONE_START.x, y: STONE_START.y };
  vel = { x: 0, y: 0 };
  sliding = false;
  score = 0;
  throwsLeft = 6;
  best = parseInt(localStorage.getItem("jogazone-curling-best") || "0", 10);
  over = false;
  drag = null;
  scoreEl.textContent = 0;
  throwsEl.textContent = throwsLeft;
  bestEl.textContent = best;
}

function throwStone(vx, vy) {
  if (sliding || over) return;
  vel = { x: vx, y: vy };
  sliding = true;
}

canvas.addEventListener("mousedown", (e) => {
  if (sliding || over) return;
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (W / rect.width);
  const y = (e.clientY - rect.top) * (H / rect.height);
  drag = { startX: x, startY: y, curX: x, curY: y };
});

window.addEventListener("mousemove", (e) => {
  if (!drag) return;
  const rect = canvas.getBoundingClientRect();
  drag.curX = (e.clientX - rect.left) * (W / rect.width);
  drag.curY = (e.clientY - rect.top) * (H / rect.height);
});

window.addEventListener("mouseup", () => {
  if (!drag) return;
  let dx = drag.startX - drag.curX;
  let dy = drag.startY - drag.curY;
  const dist = Math.min(MAX_DRAG, Math.hypot(dx, dy));
  const angle = Math.atan2(dy, dx);
  dx = Math.cos(angle) * dist;
  dy = Math.sin(angle) * dist;
  drag = null;
  if (dist > 8) {
    throwStone(dx * (POWER_SCALE / 10), dy * (POWER_SCALE / 10));
  }
});

function scoreForPosition(x, y) {
  const dist = Math.hypot(x - HOUSE.x, y - HOUSE.y);
  for (const ring of RINGS) {
    if (dist <= ring.r) return ring.pts;
  }
  return 0;
}

function settleStone() {
  sliding = false;
  const pts = scoreForPosition(stone.x, stone.y);
  score += pts;
  scoreEl.textContent = score;
  throwsLeft--;
  throwsEl.textContent = throwsLeft;

  if (throwsLeft <= 0) {
    over = true;
    if (score > best) {
      best = score;
      bestEl.textContent = best;
      localStorage.setItem("jogazone-curling-best", String(best));
    }
  } else {
    setTimeout(() => {
      stone = { x: STONE_START.x, y: STONE_START.y };
      vel = { x: 0, y: 0 };
    }, 900);
  }
}

function update(dt) {
  if (!sliding) return;
  const speed = Math.hypot(vel.x, vel.y);
  if (speed < 4) {
    settleStone();
    return;
  }
  const decel = FRICTION * dt;
  const newSpeed = Math.max(0, speed - decel);
  const scale = newSpeed / speed;
  vel.x *= scale;
  vel.y *= scale;

  stone.x += vel.x * dt;
  stone.y += vel.y * dt;

  if (stone.x - STONE_R < 0) { stone.x = STONE_R; vel.x *= -0.5; }
  if (stone.x + STONE_R > W) { stone.x = W - STONE_R; vel.x *= -0.5; }
  if (stone.y - STONE_R < 0) { stone.y = STONE_R; vel.y *= 0.5; }
  if (stone.y > H + 40) { settleStone(); }
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#d8ecf5";
  ctx.fillRect(0, 0, W, H);

  [55, 34, 14].forEach((r, i) => {
    ctx.fillStyle = i % 2 === 0 ? "#5da9ff" : "#fff";
    ctx.beginPath();
    ctx.arc(HOUSE.x, HOUSE.y, r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = "#ff5d73";
  ctx.beginPath();
  ctx.arc(HOUSE.x, HOUSE.y, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#2a2a2a";
  ctx.beginPath();
  ctx.arc(stone.x, stone.y, STONE_R, 0, Math.PI * 2);
  ctx.fill();

  if (drag) {
    ctx.strokeStyle = "rgba(0,0,0,.4)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(drag.startX, drag.startY);
    ctx.lineTo(drag.curX, drag.curY);
    ctx.stroke();
  }

  if (over) {
    ctx.fillStyle = "rgba(20,24,40,.8)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#eef0fb";
    ctx.font = "bold 20px 'Segoe UI'";
    ctx.textAlign = "center";
    ctx.fillText(`Fim de jogo! ${score} pontos`, W / 2, H / 2 - 10);
    ctx.font = "13px 'Segoe UI'";
    ctx.fillText("Recarrega a página para jogares de novo", W / 2, H / 2 + 16);
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
