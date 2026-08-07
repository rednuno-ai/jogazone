const W = 460, H = 280;
const canvas = document.getElementById("canvas");
canvas.width = W; canvas.height = H;
const ctx = canvas.getContext("2d");

const GROUND_Y = H - 40;
const ARCHER_X = 50;
const TARGET_X = 400;
const TARGET_Y = H - 110;
const RINGS = [{ r: 10, pts: 10, color: "#ffd166" }, { r: 22, pts: 8, color: "#ff5d73" }, { r: 34, pts: 6, color: "#5da9ff" }, { r: 46, pts: 4, color: "#eef0fb" }, { r: 58, pts: 2, color: "#1c2138" }];

let angle, power, charging, arrow, arrowsLeft, score, best, wind;

function loadBest() {
  best = Number(localStorage.getItem("jogazone-arco-best") || 0);
  document.getElementById("best").textContent = best;
}

function newWind() {
  wind = (Math.random() - 0.5) * 0.05;
}

function reset() {
  angle = 25;
  power = 0;
  charging = false;
  arrow = null;
  arrowsLeft = 6;
  score = 0;
  newWind();
  document.getElementById("arrows-left").textContent = arrowsLeft;
  document.getElementById("score").textContent = 0;
  document.getElementById("status").textContent = "▲/▼ para o ângulo. Mantém ESPAÇO para carregar e larga para disparares.";
}

window.addEventListener("keydown", (e) => {
  if (arrow || arrowsLeft <= 0) return;
  if (e.code === "ArrowUp") { angle = Math.min(70, angle + 2); e.preventDefault(); }
  if (e.code === "ArrowDown") { angle = Math.max(5, angle - 2); e.preventDefault(); }
  if (e.code === "Space" && !charging) { charging = true; power = 0; e.preventDefault(); }
});
window.addEventListener("keyup", (e) => {
  if (e.code === "Space" && charging) {
    charging = false;
    shoot();
    e.preventDefault();
  }
});

function shoot() {
  const rad = (angle * Math.PI) / 180;
  const speed = 4 + power * 0.11;
  arrow = { x: ARCHER_X, y: GROUND_Y - 20, vx: Math.cos(rad) * speed, vy: -Math.sin(rad) * speed };
  document.getElementById("status").textContent = "A voar...";
}

function resolveShot() {
  const dist = Math.hypot(arrow.x - TARGET_X, arrow.y - TARGET_Y);
  let pts = 0;
  for (const ring of RINGS) {
    if (dist <= ring.r) { pts = ring.pts; break; }
  }
  score += pts;
  document.getElementById("score").textContent = score;
  document.getElementById("status").textContent = pts > 0 ? `Boa! +${pts} pontos.` : "Falhaste o alvo.";
  arrow = null;
  arrowsLeft--;
  document.getElementById("arrows-left").textContent = arrowsLeft;
  newWind();

  if (arrowsLeft <= 0) {
    if (score > best) {
      best = score;
      localStorage.setItem("jogazone-arco-best", String(best));
      document.getElementById("best").textContent = best;
    }
    setTimeout(() => alert(`Fim! Pontuação total: ${score} / 60`), 200);
  }
}

function update() {
  if (charging) power = Math.min(100, power + 1.8);
  if (arrow) {
    arrow.vy += 0.12;
    arrow.vx += wind;
    arrow.x += arrow.vx;
    arrow.y += arrow.vy;
    if (arrow.x >= TARGET_X - 6 || arrow.y > H) resolveShot();
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#7bb8e8";
  ctx.fillRect(0, 0, W, GROUND_Y);
  ctx.fillStyle = "#a8d888";
  ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);

  RINGS.slice().reverse().forEach((ring) => {
    ctx.fillStyle = ring.color;
    ctx.beginPath();
    ctx.arc(TARGET_X, TARGET_Y, ring.r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.strokeStyle = "#5a3a24";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(TARGET_X, TARGET_Y + 58);
  ctx.lineTo(TARGET_X, GROUND_Y);
  ctx.stroke();

  ctx.font = "30px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("🏹", ARCHER_X, GROUND_Y - 10);

  if (!arrow && arrowsLeft > 0) {
    const rad = (angle * Math.PI) / 180;
    ctx.strokeStyle = "rgba(255,255,255,.7)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ARCHER_X, GROUND_Y - 20);
    ctx.lineTo(ARCHER_X + Math.cos(rad) * 30, GROUND_Y - 20 - Math.sin(rad) * 30);
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,.2)";
    ctx.fillRect(20, 20, 100, 10);
    ctx.fillStyle = "#ffd166";
    ctx.fillRect(20, 20, power, 10);

    ctx.fillStyle = "#10131f";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`Vento: ${wind > 0 ? "→" : "←"} ${Math.abs(wind * 100).toFixed(0)}`, 20, 45);
  }

  if (arrow) {
    ctx.save();
    ctx.translate(arrow.x, arrow.y);
    ctx.rotate(Math.atan2(arrow.vy, arrow.vx));
    ctx.strokeStyle = "#5a3a24";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(10, 0);
    ctx.stroke();
    ctx.restore();
  }
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
