const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let W, H;

function resize() {
  const maxW = Math.min(640, canvas.parentElement.clientWidth);
  W = canvas.width = maxW;
  H = canvas.height = Math.round(maxW * 0.65);
}
resize();
window.addEventListener("resize", resize);

const PALETTES = [
  { core: "#5da9ff", glow: "rgba(93,169,255,.55)", points: 10 },
  { core: "#7ee8b5", glow: "rgba(126,232,181,.55)", points: 10 },
  { core: "#c58bff", glow: "rgba(197,139,255,.55)", points: 10 },
  { core: "#ff5d73", glow: "rgba(255,93,115,.55)", points: 10 },
  { core: "#ffd166", glow: "rgba(255,209,102,.6)", points: 25 }
];

let orbs, particles, score, best, timeLeft, combo, running, timerId, spawnId;

function loadBest() {
  best = Number(localStorage.getItem("jogazone-nebulosa-best") || 0);
  document.getElementById("best").textContent = best;
}

function spawnOrb() {
  const golden = Math.random() < 0.15;
  const palette = golden ? PALETTES[4] : PALETTES[Math.floor(Math.random() * 4)];
  const radius = golden ? 16 : 22 + Math.random() * 10;
  orbs.push({
    x: radius + Math.random() * (W - radius * 2),
    y: radius + Math.random() * (H - radius * 2),
    radius,
    palette,
    born: performance.now(),
    life: golden ? 1400 : 2200 + Math.random() * 800,
    pulse: Math.random() * Math.PI * 2
  });
}

function burst(x, y, color) {
  for (let i = 0; i < 14; i++) {
    const angle = (Math.PI * 2 * i) / 14;
    const speed = 1.5 + Math.random() * 2.5;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      color
    });
  }
}

function reset() {
  orbs = [];
  particles = [];
  score = 0;
  combo = 0;
  timeLeft = 45;
  running = true;
  document.getElementById("score").textContent = score;
  document.getElementById("timer").textContent = timeLeft;

  clearInterval(timerId);
  clearInterval(spawnId);
  timerId = setInterval(() => {
    timeLeft--;
    document.getElementById("timer").textContent = timeLeft;
    if (timeLeft <= 0) endGame();
  }, 1000);
  spawnId = setInterval(() => {
    if (orbs.length < 6) spawnOrb();
  }, 550);

  spawnOrb();
  spawnOrb();
}

function endGame() {
  running = false;
  clearInterval(timerId);
  clearInterval(spawnId);
  if (score > best) {
    best = score;
    localStorage.setItem("jogazone-nebulosa-best", String(best));
    document.getElementById("best").textContent = best;
  }
}

canvas.addEventListener("click", (e) => {
  if (!running) return;
  const rect = canvas.getBoundingClientRect();
  const scale = W / rect.width;
  const x = (e.clientX - rect.left) * scale;
  const y = (e.clientY - rect.top) * scale;

  for (let i = orbs.length - 1; i >= 0; i--) {
    const o = orbs[i];
    if (Math.hypot(o.x - x, o.y - y) <= o.radius) {
      combo++;
      const gained = o.palette.points + Math.floor(combo / 3) * 5;
      score += gained;
      document.getElementById("score").textContent = score;
      burst(o.x, o.y, o.palette.core);
      orbs.splice(i, 1);
      return;
    }
  }
  combo = 0;
});

function drawOrb(o, now) {
  const age = now - o.born;
  const lifeRatio = 1 - age / o.life;
  if (lifeRatio <= 0) return false;

  const pulse = 1 + Math.sin(now / 180 + o.pulse) * 0.08;
  const r = o.radius * pulse * Math.min(1, lifeRatio * 3);

  ctx.save();
  ctx.globalAlpha = Math.min(1, lifeRatio * 2);
  ctx.shadowBlur = 25;
  ctx.shadowColor = o.palette.glow;
  const grad = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, r);
  grad.addColorStop(0, "#ffffff");
  grad.addColorStop(0.35, o.palette.core);
  grad.addColorStop(1, o.palette.glow);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(o.x, o.y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  return true;
}

function loop() {
  const now = performance.now();
  ctx.clearRect(0, 0, W, H);

  orbs = orbs.filter((o) => drawOrb(o, now));
  orbs = orbs.filter((o) => now - o.born < o.life);

  particles.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 0.03;
  });
  particles = particles.filter((p) => p.life > 0);
  particles.forEach((p) => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  if (!running && orbs.length === 0 && particles.length === 0) {
    ctx.save();
    ctx.fillStyle = "#eef0fb";
    ctx.font = "bold 22px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`Fim de jogo — ${score} pontos`, W / 2, H / 2 - 10);
    ctx.font = "14px 'Segoe UI', sans-serif";
    ctx.fillStyle = "rgba(255,255,255,.6)";
    ctx.fillText("Clica para jogar novamente", W / 2, H / 2 + 18);
    ctx.restore();
  }

  requestAnimationFrame(loop);
}

canvas.addEventListener("click", () => {
  if (!running && orbs.length === 0) reset();
});

loadBest();
reset();
loop();
