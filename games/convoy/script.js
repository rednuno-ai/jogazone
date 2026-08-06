const W = 320, H = 560;
const canvas = document.getElementById("canvas");
canvas.width = W; canvas.height = H;
const ctx = canvas.getContext("2d");

const LANES = [W * 0.22, W * 0.5, W * 0.78];
const TRUCK_GAP = 60;
const DELAY_FRAMES = 18;

let laneHistory, trucksAlive, obstacles, distance, best, speed, running, dashOffset, spawnTimer, leaderLane;

function loadBest() {
  best = Number(localStorage.getItem("jogazone-convoy-best") || 0);
  document.getElementById("best").textContent = best;
}

function reset() {
  leaderLane = 1;
  laneHistory = new Array(DELAY_FRAMES * 2).fill(1);
  trucksAlive = [true, true, true];
  obstacles = [];
  distance = 0;
  speed = 3;
  running = true;
  dashOffset = 0;
  spawnTimer = 0;
  document.getElementById("score").textContent = 0;
  document.getElementById("alive").textContent = 3;
}

window.addEventListener("keydown", (e) => {
  if (!running) return;
  if (e.code === "ArrowLeft" && leaderLane > 0) leaderLane--;
  if (e.code === "ArrowRight" && leaderLane < 2) leaderLane++;
});

function spawnObstacle() {
  const lane = Math.floor(Math.random() * 3);
  obstacles.push({ lane, y: -40 });
}

function truckY(index) {
  return H - 90 - index * TRUCK_GAP;
}

function truckLane(index) {
  const framesBack = index * (DELAY_FRAMES / 1.4);
  const idx = Math.max(0, laneHistory.length - 1 - Math.floor(framesBack));
  return laneHistory[idx];
}

function update() {
  distance += speed / 8;
  speed = Math.min(8, 3 + distance / 500);
  document.getElementById("score").textContent = Math.floor(distance);

  laneHistory.push(leaderLane);
  if (laneHistory.length > 300) laneHistory.shift();

  dashOffset = (dashOffset + speed) % 40;

  spawnTimer--;
  if (spawnTimer <= 0) {
    spawnObstacle();
    spawnTimer = Math.max(30, 60 - distance / 20);
  }

  obstacles.forEach((o) => (o.y += speed));
  obstacles = obstacles.filter((o) => o.y < H + 40);

  for (let i = 0; i < 3; i++) {
    if (!trucksAlive[i]) continue;
    const lane = truckLane(i);
    const y = truckY(i);
    for (const o of obstacles) {
      if (o.lane === lane && Math.abs(o.y - y) < 34) {
        trucksAlive[i] = false;
      }
    }
  }

  const aliveCount = trucksAlive.filter(Boolean).length;
  document.getElementById("alive").textContent = aliveCount;
  if (aliveCount === 0) {
    running = false;
    if (Math.floor(distance) > best) {
      best = Math.floor(distance);
      localStorage.setItem("jogazone-convoy-best", String(best));
      document.getElementById("best").textContent = best;
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
    ctx.font = "30px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🚧", LANES[o.lane], o.y);
  });

  for (let i = 0; i < 3; i++) {
    const lane = truckLane(i);
    const y = truckY(i);
    ctx.font = "32px sans-serif";
    ctx.textAlign = "center";
    ctx.globalAlpha = trucksAlive[i] ? 1 : 0.15;
    ctx.fillText("🚚", LANES[lane], y);
    ctx.globalAlpha = 1;
  }

  if (!running) {
    ctx.fillStyle = "rgba(16,19,31,.8)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#eef0fb";
    ctx.font = "bold 18px 'Segoe UI'";
    ctx.textAlign = "center";
    ctx.fillText(`Comboio perdido! ${Math.floor(distance)}m`, W / 2, H / 2 - 10);
    ctx.font = "13px 'Segoe UI'";
    ctx.fillStyle = "rgba(255,255,255,.7)";
    ctx.fillText("Clica para recomeçar", W / 2, H / 2 + 16);
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
