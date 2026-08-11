const W = 360, H = 480;
const canvas = document.getElementById("canvas");
canvas.width = W; canvas.height = H;
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");

const LAYER_H = 26;
const COLORS = ["#5da9ff", "#7ee8b5", "#ffd166", "#ff5d73", "#c792ea", "#ff9a5a"];

let baseX, baseW, movingX, movingW, dir, speed, score, best, over, colorIdx;

function reset() {
  baseX = W / 2 - 70;
  baseW = 140;
  movingW = baseW;
  movingX = 0;
  dir = 1;
  speed = 140;
  score = 0;
  best = parseInt(localStorage.getItem("jogazone-torres-coloridas-best") || "0", 10);
  over = false;
  colorIdx = 0;
  scoreEl.textContent = 0;
  bestEl.textContent = best;
}

function drop() {
  if (over) { reset(); return; }
  const overlapStart = Math.max(baseX, movingX);
  const overlapEnd = Math.min(baseX + baseW, movingX + movingW);
  const overlapW = overlapEnd - overlapStart;

  if (overlapW <= 4) {
    over = true;
    return;
  }

  baseX = overlapStart;
  baseW = overlapW;
  score++;
  scoreEl.textContent = score;
  if (score > best) {
    best = score;
    bestEl.textContent = best;
    localStorage.setItem("jogazone-torres-coloridas-best", String(best));
  }

  movingW = baseW;
  dir = Math.random() < 0.5 ? -1 : 1;
  movingX = dir === 1 ? 0 : W - movingW;
  speed = Math.min(340, speed + 8);
  colorIdx = (colorIdx + 1) % COLORS.length;
}

canvas.addEventListener("click", drop);
window.addEventListener("keydown", (e) => {
  if (e.code === "Space") { e.preventDefault(); drop(); }
});

function update(dt) {
  if (over) return;
  movingX += dir * speed * dt;
  if (movingX <= 0) { movingX = 0; dir = 1; }
  if (movingX + movingW >= W) { movingX = W - movingW; dir = -1; }
}

function draw() {
  ctx.clearRect(0, 0, W, H);

  const baseY = H - LAYER_H;
  ctx.fillStyle = COLORS[(colorIdx + COLORS.length - 1) % COLORS.length];
  ctx.fillRect(baseX, baseY, baseW, LAYER_H);

  if (!over) {
    ctx.fillStyle = COLORS[colorIdx];
    ctx.fillRect(movingX, baseY - LAYER_H - 6, movingW, LAYER_H);
  }

  if (over) {
    ctx.fillStyle = "rgba(20,24,40,.85)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#eef0fb";
    ctx.font = "bold 22px 'Segoe UI'";
    ctx.textAlign = "center";
    ctx.fillText(`Torre desmoronou! ${score} andares`, W / 2, H / 2 - 10);
    ctx.font = "14px 'Segoe UI'";
    ctx.fillText("Clica ou prime ESPAÇO para jogares de novo", W / 2, H / 2 + 18);
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
