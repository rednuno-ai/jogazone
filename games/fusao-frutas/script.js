const W = 320, H = 440;
const canvas = document.getElementById("canvas");
canvas.width = W; canvas.height = H;
const ctx = canvas.getContext("2d");

const WALL_L = 12, WALL_R = W - 12, FLOOR_Y = H - 12;
const DANGER_Y = 55;
const GRAVITY = 0.32;

const TIERS = [
  { r: 12, emoji: "🍒", pts: 1 },
  { r: 17, emoji: "🍓", pts: 3 },
  { r: 22, emoji: "🍇", pts: 6 },
  { r: 28, emoji: "🍋", pts: 10 },
  { r: 35, emoji: "🍊", pts: 15 },
  { r: 44, emoji: "🍎", pts: 21 },
  { r: 55, emoji: "🍉", pts: 28 }
];

let fruits, nextTier, dropX, score, best, over, nextId;

function loadBest() {
  best = Number(localStorage.getItem("jogazone-fusaofrutas-best") || 0);
  document.getElementById("best").textContent = best;
}

function pickNextTier() {
  return Math.floor(Math.random() * 3);
}

function reset() {
  fruits = [];
  nextTier = pickNextTier();
  dropX = W / 2;
  score = 0;
  over = false;
  nextId = 0;
  document.getElementById("score").textContent = 0;
  document.getElementById("next-preview").textContent = TIERS[nextTier].emoji;
}

function spawnFruit(x) {
  const tier = nextTier;
  fruits.push({ id: nextId++, x, y: DANGER_Y - 10, vx: 0, vy: 0, tier, age: 0 });
  nextTier = pickNextTier();
  document.getElementById("next-preview").textContent = TIERS[nextTier].emoji;
}

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = W / rect.width;
  dropX = Math.max(WALL_L + TIERS[nextTier].r, Math.min(WALL_R - TIERS[nextTier].r, (e.clientX - rect.left) * scaleX));
});

canvas.addEventListener("click", () => {
  if (over) { reset(); return; }
  spawnFruit(dropX);
});

function update() {
  if (over) return;

  fruits.forEach((f) => {
    f.age++;
    f.vy += GRAVITY;
    f.x += f.vx;
    f.y += f.vy;
    const r = TIERS[f.tier].r;
    if (f.x - r < WALL_L) { f.x = WALL_L + r; f.vx *= -0.4; }
    if (f.x + r > WALL_R) { f.x = WALL_R - r; f.vx *= -0.4; }
    if (f.y + r > FLOOR_Y) { f.y = FLOOR_Y - r; f.vy *= -0.3; f.vx *= 0.9; }
  });

  const toRemove = new Set();
  const toAdd = [];
  for (let i = 0; i < fruits.length; i++) {
    for (let j = i + 1; j < fruits.length; j++) {
      const a = fruits[i], b = fruits[j];
      if (toRemove.has(a.id) || toRemove.has(b.id)) continue;
      const ra = TIERS[a.tier].r, rb = TIERS[b.tier].r;
      const dx = b.x - a.x, dy = b.y - a.y;
      const dist = Math.hypot(dx, dy) || 0.01;
      if (dist < ra + rb) {
        if (a.tier === b.tier && a.tier < TIERS.length - 1) {
          toRemove.add(a.id);
          toRemove.add(b.id);
          toAdd.push({ id: nextId++, x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, vx: 0, vy: -2, tier: a.tier + 1, age: 0 });
          score += TIERS[a.tier + 1].pts;
          document.getElementById("score").textContent = score;
        } else {
          const overlap = (ra + rb - dist) / 2;
          const nx = dx / dist, ny = dy / dist;
          a.x -= nx * overlap; a.y -= ny * overlap;
          b.x += nx * overlap; b.y += ny * overlap;
          const push = 0.5;
          a.vx -= nx * push; b.vx += nx * push;
        }
      }
    }
  }
  fruits = fruits.filter((f) => !toRemove.has(f.id)).concat(toAdd);

  for (const f of fruits) {
    const r = TIERS[f.tier].r;
    if (f.age > 90 && f.y - r < DANGER_Y - 15 && Math.abs(f.vy) < 1.2) {
      over = true;
      if (score > best) {
        best = score;
        localStorage.setItem("jogazone-fusaofrutas-best", String(best));
        document.getElementById("best").textContent = best;
      }
      break;
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#fdf6e3";
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = "rgba(255,93,115,.6)";
  ctx.setLineDash([6, 6]);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, DANGER_Y);
  ctx.lineTo(W, DANGER_Y);
  ctx.stroke();
  ctx.setLineDash([]);

  fruits.forEach((f) => {
    const r = TIERS[f.tier].r;
    ctx.font = `${r * 1.7}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(TIERS[f.tier].emoji, f.x, f.y);
  });

  if (!over) {
    ctx.globalAlpha = 0.5;
    ctx.font = `${TIERS[nextTier].r * 1.7}px sans-serif`;
    ctx.fillText(TIERS[nextTier].emoji, dropX, DANGER_Y - 15);
    ctx.globalAlpha = 1;
  }

  if (over) {
    ctx.fillStyle = "rgba(20,24,40,.82)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#eef0fb";
    ctx.font = "bold 20px 'Segoe UI'";
    ctx.fillText(`Fim de jogo! ${score} pontos`, W / 2, H / 2 - 10);
    ctx.font = "13px 'Segoe UI'";
    ctx.fillStyle = "rgba(255,255,255,.85)";
    ctx.fillText("Clica para jogar de novo", W / 2, H / 2 + 16);
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loadBest();
reset();
loop();
