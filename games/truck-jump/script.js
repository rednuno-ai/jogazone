const W = 420, H = 300;
const canvas = document.getElementById("canvas");
canvas.width = W; canvas.height = H;
const ctx = canvas.getContext("2d");

let power, powerDir, phase, t, coins, coinPositions, dist, best, totalCoins, flying;

function loadBest() {
  best = Number(localStorage.getItem("jogazone-truckjump-best") || 0);
  document.getElementById("best").textContent = best;
}

function reset() {
  power = 0;
  powerDir = 1;
  phase = "charging";
  flying = false;
  dist = 0;
  document.getElementById("dist").textContent = 0;
}

function launch() {
  if (phase !== "charging") return;
  phase = "flying";
  flying = true;
  t = 0;
  coins = Math.round(3 + power / 25);
  coinPositions = Array.from({ length: coins }, (_, i) => ({
    frac: 0.2 + (i / coins) * 0.6 + Math.random() * 0.05,
    taken: false
  }));
}

document.getElementById("jump-btn").addEventListener("click", launch);
window.addEventListener("keydown", (e) => { if (e.code === "Space") { e.preventDefault(); launch(); } });

function update() {
  if (phase === "charging") {
    power += powerDir * 2.2;
    if (power >= 100) { power = 100; powerDir = -1; }
    if (power <= 0) { power = 0; powerDir = 1; }
  } else if (phase === "flying") {
    t += 0.02;
    if (t >= 1) {
      dist = Math.round(20 + power * 3 + Math.random() * 10);
      document.getElementById("dist").textContent = dist;
      if (dist > best) {
        best = dist;
        localStorage.setItem("jogazone-truckjump-best", String(best));
        document.getElementById("best").textContent = best;
      }
      phase = "result";
      setTimeout(reset, 1200);
    } else {
      coinPositions.forEach((c) => {
        if (!c.taken && Math.abs(t - c.frac) < 0.03) {
          c.taken = true;
          totalCoins++;
          document.getElementById("coins").textContent = totalCoins;
        }
      });
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#10131f";
  ctx.fillRect(0, H - 40, W, 40);

  // Rampa
  ctx.fillStyle = "#5da9ff";
  ctx.beginPath();
  ctx.moveTo(20, H - 40);
  ctx.lineTo(80, H - 90);
  ctx.lineTo(80, H - 40);
  ctx.closePath();
  ctx.fill();

  if (phase === "flying" || phase === "result") {
    const x = 80 + (W - 140) * t;
    const arc = Math.sin(Math.PI * t) * 110;
    const y = (H - 90) - arc;

    coinPositions && coinPositions.forEach((c) => {
      const cx = 80 + (W - 140) * c.frac;
      const cArc = Math.sin(Math.PI * c.frac) * 110;
      const cy = (H - 90) - cArc;
      if (!c.taken) {
        ctx.font = "18px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("🪙", cx, cy);
      }
    });

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.min(0.5, t * 1.2) - (t > 0.5 ? (t - 0.5) * 1.2 : 0));
    ctx.font = "34px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🚚", 0, 0);
    ctx.restore();
  } else {
    ctx.font = "34px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🚚", 55, H - 55);
  }

  // Barra de potência
  ctx.fillStyle = "rgba(255,255,255,.1)";
  ctx.fillRect(20, 20, W - 40, 16);
  ctx.fillStyle = power > 85 ? "#ffd166" : "#ff5d73";
  ctx.fillRect(20, 20, (W - 40) * (power / 100), 16);
  ctx.strokeStyle = "rgba(255,255,255,.3)";
  ctx.strokeRect(20, 20, W - 40, 16);
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loadBest();
totalCoins = 0;
reset();
loop();
