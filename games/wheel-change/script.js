const W = 320, H = 320;
const canvas = document.getElementById("canvas");
canvas.width = W; canvas.height = H;
const ctx = canvas.getContext("2d");
const CX = W / 2, CY = H / 2, R = 110;

let angle, targetStart, targetSpan, bolt, running, startTime, elapsed, best, speed;

function loadBest() {
  const saved = localStorage.getItem("jogazone-wheelchange-best");
  best = saved ? Number(saved) : null;
  document.getElementById("best").textContent = best ? best.toFixed(1) : "—";
}

function newTarget() {
  targetStart = Math.random() * Math.PI * 2;
  targetSpan = 0.55 - bolt * 0.06;
  speed = 0.045 + bolt * 0.012;
}

function start() {
  bolt = 0;
  angle = 0;
  running = true;
  startTime = performance.now();
  document.getElementById("bolt").textContent = 0;
  newTarget();
}

function inZone() {
  const a = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const s = ((targetStart % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  let diff = a - s;
  if (diff < 0) diff += Math.PI * 2;
  return diff < targetSpan;
}

function attempt() {
  if (!running) return;
  if (inZone()) {
    bolt++;
    document.getElementById("bolt").textContent = bolt;
    if (bolt >= 5) {
      running = false;
      const total = (performance.now() - startTime) / 1000;
      document.getElementById("time").textContent = total.toFixed(1);
      if (!best || total < best) {
        best = total;
        localStorage.setItem("jogazone-wheelchange-best", String(best));
        document.getElementById("best").textContent = best.toFixed(1);
      }
    } else {
      newTarget();
    }
  } else {
    startTime -= 500; // penalidade
  }
}

canvas.addEventListener("click", attempt);
window.addEventListener("keydown", (e) => { if (e.code === "Space") { e.preventDefault(); attempt(); } });
document.getElementById("start-btn").addEventListener("click", start);

function update() {
  if (!running) return;
  angle += speed;
  document.getElementById("time").textContent = ((performance.now() - startTime) / 1000).toFixed(1);
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(255,255,255,.15)";
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.arc(CX, CY, R, 0, Math.PI * 2);
  ctx.stroke();

  if (running) {
    ctx.strokeStyle = "#7ee8b5";
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(CX, CY, R, targetStart, targetStart + targetSpan);
    ctx.stroke();

    const px = CX + Math.cos(angle) * R;
    const py = CY + Math.sin(angle) * R;
    ctx.fillStyle = "#ff5d73";
    ctx.beginPath();
    ctx.arc(px, py, 10, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.font = "40px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("🔩", CX, CY);
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loadBest();
bolt = 0; running = false; angle = 0; newTarget();
loop();
