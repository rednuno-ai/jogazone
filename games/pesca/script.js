const W = 260, H = 420;
const canvas = document.getElementById("canvas");
canvas.width = W; canvas.height = H;
const ctx = canvas.getContext("2d");

const caughtEl = document.getElementById("caught");
const escapedEl = document.getElementById("escaped");

const BAR_TOP = 20, BAR_BOTTOM = 400;
const ZONE_HALF = 0.11;
const RISE_SPEED = 0.7;
const FALL_SPEED = 0.45;
const PROGRESS_RATE = 55;
const PROGRESS_DECAY = 30;

let fishPos, fishTarget, fishTimer, reelPos, progress, holding, caught, escaped, fishSpeed;

function reset() {
  caught = 0;
  escaped = 0;
  caughtEl.textContent = 0;
  escapedEl.textContent = 0;
  newFish();
}

function newFish() {
  fishPos = 0.5;
  fishTarget = Math.random();
  fishTimer = 0;
  fishSpeed = 0.5 + Math.min(1.2, caught * 0.08);
  reelPos = 0.5;
  progress = 30;
  holding = false;
}

window.addEventListener("keydown", (e) => {
  if (e.code === "Space") { e.preventDefault(); holding = true; }
});
window.addEventListener("keyup", (e) => {
  if (e.code === "Space") holding = false;
});
canvas.addEventListener("mousedown", () => { holding = true; });
window.addEventListener("mouseup", () => { holding = false; });

function update(dt) {
  fishTimer -= dt;
  if (fishTimer <= 0) {
    fishTarget = Math.random();
    fishTimer = 0.4 + Math.random() * 0.5;
  }
  const dir = fishTarget - fishPos;
  fishPos += Math.sign(dir) * Math.min(Math.abs(dir), fishSpeed * dt);
  fishPos = Math.max(0, Math.min(1, fishPos));

  if (holding) reelPos += RISE_SPEED * dt;
  else reelPos -= FALL_SPEED * dt;
  reelPos = Math.max(0, Math.min(1, reelPos));

  const aligned = Math.abs(fishPos - reelPos) < ZONE_HALF;
  progress += (aligned ? PROGRESS_RATE : -PROGRESS_DECAY) * dt;
  progress = Math.max(0, Math.min(100, progress));

  if (progress >= 100) {
    caught++;
    caughtEl.textContent = caught;
    newFish();
  } else if (progress <= 0) {
    escaped++;
    escapedEl.textContent = escaped;
    newFish();
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#0d2a4a";
  ctx.fillRect(0, 0, W, H);

  const barX = 40, barW = 20;
  ctx.fillStyle = "rgba(255,255,255,.08)";
  ctx.fillRect(barX, BAR_TOP, barW, BAR_BOTTOM - BAR_TOP);

  const zoneY = BAR_TOP + (1 - reelPos) * (BAR_BOTTOM - BAR_TOP) - ZONE_HALF * (BAR_BOTTOM - BAR_TOP);
  const zoneH = ZONE_HALF * 2 * (BAR_BOTTOM - BAR_TOP);
  ctx.fillStyle = "rgba(126,232,181,.35)";
  ctx.fillRect(barX, zoneY, barW, zoneH);

  const fishY = BAR_TOP + (1 - fishPos) * (BAR_BOTTOM - BAR_TOP);
  ctx.fillStyle = "#ffd166";
  ctx.beginPath();
  ctx.ellipse(barX + barW / 2, fishY, 14, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  const progX = 160, progW = 30;
  ctx.fillStyle = "rgba(255,255,255,.1)";
  ctx.fillRect(progX, BAR_TOP, progW, BAR_BOTTOM - BAR_TOP);
  const fillH = (progress / 100) * (BAR_BOTTOM - BAR_TOP);
  ctx.fillStyle = "#5da9ff";
  ctx.fillRect(progX, BAR_BOTTOM - fillH, progW, fillH);
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
