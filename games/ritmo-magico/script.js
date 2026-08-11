const W = 320, H = 440;
const canvas = document.getElementById("canvas");
canvas.width = W; canvas.height = H;
const ctx = canvas.getContext("2d");

const LANES = 4;
const LANE_W = W / LANES;
const HIT_Y = 380;
const TOLERANCE = 26;
const KEY_LABELS = ["D", "F", "J", "K"];
const LANE_COLORS = ["#ff5d73", "#ffd166", "#5da9ff", "#7ee8b5"];

let notes, score, combo, lives, speed, spawnTimer, elapsed, over, flash;

function reset() {
  notes = [];
  score = 0;
  combo = 0;
  lives = 3;
  speed = 2.4;
  spawnTimer = 0;
  elapsed = 0;
  over = false;
  flash = [0, 0, 0, 0];
  document.getElementById("score").textContent = 0;
  document.getElementById("combo").textContent = 0;
  document.getElementById("lives").textContent = lives;
}

function spawnNote() {
  const lane = Math.floor(Math.random() * LANES);
  notes.push({ lane, y: -20, hit: false, missed: false });
}

window.addEventListener("keydown", (e) => {
  if (over) { if (e.code === "Space") reset(); return; }
  const idx = KEY_LABELS.findIndex((k) => e.code === "Key" + k);
  if (idx === -1) return;
  e.preventDefault();
  flash[idx] = 8;

  let bestNote = null, bestDist = TOLERANCE;
  for (const n of notes) {
    if (n.lane === idx && !n.hit && !n.missed) {
      const dist = Math.abs(n.y - HIT_Y);
      if (dist < bestDist) { bestDist = dist; bestNote = n; }
    }
  }
  if (bestNote) {
    bestNote.hit = true;
    combo++;
    score += 10 + Math.floor(combo / 5) * 5;
    document.getElementById("score").textContent = score;
    document.getElementById("combo").textContent = combo;
  }
});

function loseLife() {
  lives--;
  combo = 0;
  document.getElementById("combo").textContent = 0;
  document.getElementById("lives").textContent = lives;
  if (lives <= 0) over = true;
}

function update(dt) {
  if (over) return;
  elapsed += dt;
  speed = Math.min(6.5, 2.4 + elapsed / 20);

  spawnTimer -= dt;
  if (spawnTimer <= 0) {
    spawnNote();
    spawnTimer = Math.max(0.45, 0.95 - elapsed / 60);
  }

  notes.forEach((n) => { if (!n.hit) n.y += speed; });
  notes.forEach((n) => {
    if (!n.hit && !n.missed && n.y > HIT_Y + TOLERANCE) {
      n.missed = true;
      loseLife();
    }
  });
  notes = notes.filter((n) => n.y < H + 20);

  flash.forEach((v, i) => { if (v > 0) flash[i]--; });
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#10131f";
  ctx.fillRect(0, 0, W, H);

  for (let i = 0; i < LANES; i++) {
    ctx.fillStyle = flash[i] > 0 ? "rgba(255,255,255,.08)" : "rgba(255,255,255,.02)";
    ctx.fillRect(i * LANE_W, 0, LANE_W, H);
    ctx.strokeStyle = "rgba(255,255,255,.08)";
    ctx.beginPath();
    ctx.moveTo(i * LANE_W, 0);
    ctx.lineTo(i * LANE_W, H);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(255,255,255,.5)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, HIT_Y);
  ctx.lineTo(W, HIT_Y);
  ctx.stroke();

  for (let i = 0; i < LANES; i++) {
    ctx.fillStyle = "rgba(255,255,255,.5)";
    ctx.font = "16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(KEY_LABELS[i], i * LANE_W + LANE_W / 2, HIT_Y + 30);
  }

  notes.forEach((n) => {
    if (n.hit) return;
    ctx.fillStyle = n.missed ? "rgba(255,93,115,.4)" : LANE_COLORS[n.lane];
    ctx.beginPath();
    ctx.roundRect(n.lane * LANE_W + 10, n.y - 12, LANE_W - 20, 24, 6);
    ctx.fill();
  });

  if (over) {
    ctx.fillStyle = "rgba(20,24,40,.82)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#eef0fb";
    ctx.font = "bold 20px 'Segoe UI'";
    ctx.textAlign = "center";
    ctx.fillText(`Fim de jogo! ${score} pontos`, W / 2, H / 2 - 10);
    ctx.font = "13px 'Segoe UI'";
    ctx.fillStyle = "rgba(255,255,255,.8)";
    ctx.fillText("Prime ESPAÇO para tentares de novo", W / 2, H / 2 + 16);
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
