const W = 320, H = 560;
const canvas = document.getElementById("canvas");
canvas.width = W; canvas.height = H;
const ctx = canvas.getContext("2d");

const LANES = [W * 0.22, W * 0.5, W * 0.78];

let player, obstacles, dashOffset, speed, distance, best, running, spawnTimer;

function loadBest() {
  best = Number(localStorage.getItem("jogazone-tyredodge-best") || 0);
  document.getElementById("best").textContent = best;
}

function reset() {
  player = { lane: 1, x: LANES[1] };
  obstacles = [];
  dashOffset = 0;
  speed = 4;
  distance = 0;
  running = true;
  spawnTimer = 0;
  document.getElementById("score").textContent = 0;
}

window.addEventListener("keydown", (e) => {
  if (!running) return;
  if (e.code === "ArrowLeft" && player.lane > 0) player.lane--;
  if (e.code === "ArrowRight" && player.lane < 2) player.lane++;
});

function spawnObstacle() {
  const lane = Math.floor(Math.random() * 3);
  obstacles.push({ lane, y: -40, spin: 0 });
}

function update() {
  distance += speed / 8;
  speed = Math.min(11, 4 + distance / 300);
  document.getElementById("score").textContent = Math.floor(distance);

  player.x += (LANES[player.lane] - player.x) * 0.25;
  dashOffset = (dashOffset + speed) % 40;

  spawnTimer--;
  if (spawnTimer <= 0) {
    spawnObstacle();
    spawnTimer = Math.max(24, 50 - distance / 15);
  }

  obstacles.forEach((o) => { o.y += speed; o.spin += 0.3; });
  obstacles = obstacles.filter((o) => o.y < H + 40);

  for (const o of obstacles) {
    if (o.lane === player.lane && Math.abs(o.y - (H - 90)) < 40) {
      running = false;
      if (Math.floor(distance) > best) {
        best = Math.floor(distance);
        localStorage.setItem("jogazone-tyredodge-best", String(best));
        document.getElementById("best").textContent = best;
      }
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#1c2138";
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = "rgba(255,255,255,.3)";
  ctx.lineWidth = 3;
  ctx.setLineDash([20, 16]);
  ctx.lineDashOffset = -dashOffset;
  [W / 3, (W / 3) * 2].forEach((x) => {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  });
  ctx.setLineDash([]);

  obstacles.forEach((o) => {
    ctx.save();
    ctx.translate(LANES[o.lane], o.y);
    ctx.rotate(o.spin);
    ctx.fillStyle = "#1a1a1a";
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#3a3a3a";
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  ctx.font = "34px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("🚚", player.x, H - 70);

  if (!running) {
    ctx.fillStyle = "rgba(16,19,31,.8)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#eef0fb";
    ctx.font = "bold 18px 'Segoe UI'";
    ctx.fillText(`Colidiste! ${Math.floor(distance)}m`, W / 2, H / 2 - 10);
    ctx.font = "13px 'Segoe UI'";
    ctx.fillStyle = "rgba(255,255,255,.7)";
    ctx.fillText("Clica para tentar de novo", W / 2, H / 2 + 16);
  }
}

function loop() {
  if (running) update();
  draw();
  requestAnimationFrame(loop);
}

canvas.addEventListener("click", () => { if (!running) reset(); });
loadBest();
reset();
loop();
