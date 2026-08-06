const W = 320, H = 560;
const canvas = document.getElementById("canvas");
canvas.width = W; canvas.height = H;
const ctx = canvas.getContext("2d");
const LANES = [W * 0.22, W * 0.5, W * 0.78];

let player, obstacles, dashOffset, speed, distance, best, running, spawnTimer, timeLeft, timerId, snowParticles;

function loadBest() {
  best = Number(localStorage.getItem("jogazone-snowplow-best") || 0);
  document.getElementById("best").textContent = best;
}

function reset() {
  player = { lane: 1, x: LANES[1] };
  obstacles = [];
  dashOffset = 0;
  speed = 4.5;
  distance = 0;
  running = true;
  spawnTimer = 0;
  timeLeft = 45;
  snowParticles = Array.from({ length: 40 }, () => ({ x: Math.random() * W, y: Math.random() * H, s: 1 + Math.random() * 2 }));
  document.getElementById("score").textContent = 0;
  document.getElementById("timer").textContent = timeLeft;

  clearInterval(timerId);
  timerId = setInterval(() => {
    if (!running) return;
    timeLeft--;
    document.getElementById("timer").textContent = timeLeft;
    if (timeLeft <= 0) endGame();
  }, 1000);
}

window.addEventListener("keydown", (e) => {
  if (!running) return;
  if (e.code === "ArrowLeft" && player.lane > 0) player.lane--;
  if (e.code === "ArrowRight" && player.lane < 2) player.lane++;
});

function spawnObstacle() {
  const lane = Math.floor(Math.random() * 3);
  const kind = Math.random() < 0.5 ? "rock" : "car";
  obstacles.push({ lane, y: -40, kind });
}

function endGame() {
  running = false;
  clearInterval(timerId);
  if (Math.floor(distance) > best) {
    best = Math.floor(distance);
    localStorage.setItem("jogazone-snowplow-best", String(best));
    document.getElementById("best").textContent = best;
  }
}

function update() {
  if (!running) return;
  distance += speed / 8;
  speed = Math.min(10, 4.5 + distance / 250);
  document.getElementById("score").textContent = Math.floor(distance);

  player.x += (LANES[player.lane] - player.x) * 0.25;
  dashOffset = (dashOffset + speed) % 40;

  snowParticles.forEach((p) => { p.y += speed * 0.6; if (p.y > H) { p.y = -5; p.x = Math.random() * W; } });

  spawnTimer--;
  if (spawnTimer <= 0) {
    spawnObstacle();
    spawnTimer = Math.max(30, 60 - distance / 15);
  }

  obstacles.forEach((o) => (o.y += speed));
  obstacles = obstacles.filter((o) => o.y < H + 40);

  for (const o of obstacles) {
    if (o.lane === player.lane && Math.abs(o.y - (H - 90)) < 40) endGame();
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#c7d7e0";
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = "rgba(255,255,255,.6)";
  ctx.lineWidth = 3;
  ctx.setLineDash([20, 16]);
  ctx.lineDashOffset = -dashOffset;
  [W / 3, (W / 3) * 2].forEach((x) => {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  });
  ctx.setLineDash([]);

  ctx.fillStyle = "#ffffff";
  snowParticles.forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
    ctx.fill();
  });

  obstacles.forEach((o) => {
    ctx.font = "28px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(o.kind === "rock" ? "🪨" : "🚗", LANES[o.lane], o.y);
  });

  ctx.font = "34px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("🚛", player.x, H - 70);

  if (!running) {
    ctx.fillStyle = "rgba(16,19,31,.75)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#eef0fb";
    ctx.font = "bold 18px 'Segoe UI'";
    ctx.fillText(`Fim! Limpaste ${Math.floor(distance)}m`, W / 2, H / 2 - 10);
    ctx.font = "13px 'Segoe UI'";
    ctx.fillStyle = "rgba(255,255,255,.85)";
    ctx.fillText("Clica para tentar de novo", W / 2, H / 2 + 16);
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

canvas.addEventListener("click", () => { if (!running) reset(); });
loadBest();
reset();
loop();
