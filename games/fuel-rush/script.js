const W = 320, H = 560;
const canvas = document.getElementById("canvas");
canvas.width = W; canvas.height = H;
const ctx = canvas.getContext("2d");

const LANES = [W * 0.22, W * 0.5, W * 0.78];
const GOAL = 1500;

let player, items, fuel, distance, speed, running, dashOffset, spawnTimer;

function reset() {
  player = { lane: 1, x: LANES[1] };
  items = [];
  fuel = 100;
  distance = 0;
  speed = 3.2;
  running = true;
  dashOffset = 0;
  spawnTimer = 0;
  document.getElementById("dist").textContent = 0;
  document.getElementById("goal").textContent = GOAL;
  document.getElementById("fuel").textContent = 100;
}

window.addEventListener("keydown", (e) => {
  if (!running) return;
  if (e.code === "ArrowLeft" && player.lane > 0) player.lane--;
  if (e.code === "ArrowRight" && player.lane < 2) player.lane++;
});

function spawnItem() {
  const lane = Math.floor(Math.random() * 3);
  const isFuel = Math.random() < 0.55;
  items.push({ lane, y: -40, isFuel });
}

function update() {
  distance += speed / 8;
  fuel -= 0.09 + distance / 20000;
  document.getElementById("dist").textContent = Math.floor(distance);
  document.getElementById("fuel").textContent = Math.max(0, Math.floor(fuel));

  player.x += (LANES[player.lane] - player.x) * 0.25;
  dashOffset = (dashOffset + speed) % 40;

  spawnTimer--;
  if (spawnTimer <= 0) {
    spawnItem();
    spawnTimer = 40;
  }

  items.forEach((it) => (it.y += speed));
  items = items.filter((it) => {
    if (it.y > H - 120 && it.y < H - 60 && it.lane === player.lane) {
      if (it.isFuel) fuel = Math.min(100, fuel + 22);
      else fuel -= 15;
      return false;
    }
    return it.y < H + 40;
  });

  if (fuel <= 0) { running = false; document.getElementById("fuel").textContent = 0; }
  if (distance >= GOAL) { running = false; }
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

  items.forEach((it) => {
    const x = LANES[it.lane];
    ctx.font = "28px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(it.isFuel ? "⛽" : "🛢️", x, it.y);
  });

  ctx.font = "34px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("🚚", player.x, H - 70);

  if (!running) {
    ctx.fillStyle = "rgba(16,19,31,.8)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#eef0fb";
    ctx.font = "bold 18px 'Segoe UI'";
    const won = distance >= GOAL;
    ctx.fillText(won ? "🏁 Chegaste ao destino!" : "⛽ Ficaste sem combustível", W / 2, H / 2 - 10);
    ctx.font = "13px 'Segoe UI'";
    ctx.fillStyle = "rgba(255,255,255,.7)";
    ctx.fillText("Clica para jogar novamente", W / 2, H / 2 + 16);
  }
}

function loop() {
  if (running) update();
  draw();
  requestAnimationFrame(loop);
}

canvas.addEventListener("click", () => { if (!running) reset(); });
reset();
loop();
