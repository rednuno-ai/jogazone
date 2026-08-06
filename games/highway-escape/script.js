const W = 320, H = 560;
const canvas = document.getElementById("canvas");
canvas.width = W; canvas.height = H;
const ctx = canvas.getContext("2d");

const LANES = [W * 0.22, W * 0.5, W * 0.78];
const CAR_W = 40, CAR_H = 66;

let player, traffic, police, dashOffset, speed, distance, best, running, spawnTimer;

function loadBest() {
  best = Number(localStorage.getItem("jogazone-highway-best") || 0);
  document.getElementById("best").textContent = best;
}

function reset() {
  player = { lane: 1, x: LANES[1] };
  traffic = [];
  police = null;
  dashOffset = 0;
  speed = 3.5;
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

function spawnTraffic() {
  const lane = Math.floor(Math.random() * 3);
  const colors = ["#ffd166", "#c58bff", "#7ee8b5", "#ff9a5a"];
  traffic.push({ lane, y: -CAR_H, color: colors[Math.floor(Math.random() * colors.length)] });
}

function update() {
  distance += speed / 8;
  speed = Math.min(9, 3.5 + distance / 400);
  document.getElementById("score").textContent = Math.floor(distance);

  player.x += (LANES[player.lane] - player.x) * 0.25;

  dashOffset = (dashOffset + speed) % 40;

  spawnTimer -= 1;
  if (spawnTimer <= 0) {
    spawnTraffic();
    spawnTimer = Math.max(28, 55 - distance / 20);
  }

  traffic.forEach((c) => (c.y += speed));
  traffic = traffic.filter((c) => c.y < H + CAR_H);

  if (!police && distance > 300 && Math.random() < 0.004) {
    police = { lane: Math.floor(Math.random() * 3), y: -CAR_H, x: 0 };
  }
  if (police) {
    police.y += speed * 0.92;
    police.x += (LANES[police.lane] - police.x) * 0.06;
    if (Math.random() < 0.01 && police.y > 0) police.lane = player.lane;
    if (police.y > H) return gameOver();
  }

  for (const c of traffic) {
    if (c.lane === player.lane && Math.abs(c.y - (H - 90)) < (CAR_H + CAR_H) / 2 - 10) {
      return gameOver();
    }
  }
  if (police && Math.abs(police.x - player.x) < CAR_W - 8 && Math.abs(police.y - (H - 90)) < CAR_H - 10) {
    return gameOver();
  }
}

function gameOver() {
  running = false;
  if (Math.floor(distance) > best) {
    best = Math.floor(distance);
    localStorage.setItem("jogazone-highway-best", String(best));
    document.getElementById("best").textContent = best;
  }
}

function drawCar(x, y, color, label) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x - CAR_W / 2, y - CAR_H / 2, CAR_W, CAR_H, 8);
  ctx.fill();
  ctx.fillStyle = "rgba(16,19,31,.5)";
  ctx.fillRect(x - CAR_W / 2 + 6, y - CAR_H / 2 + 10, CAR_W - 12, 16);
  if (label) {
    ctx.fillStyle = "#fff";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(label, x, y + 6);
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
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  });
  ctx.setLineDash([]);

  traffic.forEach((c) => drawCar(LANES[c.lane], c.y, c.color));
  if (police) drawCar(police.x, police.y, "#5da9ff", "PSP");
  drawCar(player.x, H - 90, "#ff5d73", "🚚");

  if (!running) {
    ctx.fillStyle = "rgba(16,19,31,.75)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#eef0fb";
    ctx.font = "bold 20px 'Segoe UI'";
    ctx.textAlign = "center";
    ctx.fillText(`Apanharam-te! ${Math.floor(distance)}m`, W / 2, H / 2 - 10);
    ctx.font = "14px 'Segoe UI'";
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
