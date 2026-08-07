const W = 460, H = 300;
const canvas = document.getElementById("canvas");
canvas.width = W; canvas.height = H;
const ctx = canvas.getContext("2d");
const TRACK_HALF_W = 26;

const KEY_POINTS = [
  [90, 90], [180, 60], [280, 65], [360, 100], [400, 160],
  [370, 220], [280, 245], [180, 235], [110, 210], [70, 150]
];

function buildPath() {
  const pts = [];
  const n = KEY_POINTS.length;
  for (let i = 0; i < n; i++) {
    const a = KEY_POINTS[i], b = KEY_POINTS[(i + 1) % n];
    for (let t = 0; t < 8; t++) {
      pts.push([a[0] + (b[0] - a[0]) * (t / 8), a[1] + (b[1] - a[1]) * (t / 8)]);
    }
  }
  return pts;
}
const PATH = buildPath();

const CHECKPOINTS = [0, 20, 40, 60].map((i) => i % PATH.length);

let car, ai, lap, checkpointIdx, aiCheckpointIdx, raceTime, bestLap, lapStartTime, finished, keys;

function loadBest() {
  const saved = localStorage.getItem("jogazone-corridaGP-best");
  bestLap = saved ? Number(saved) : null;
  document.getElementById("best").textContent = bestLap ? bestLap.toFixed(1) + "s" : "—";
}

function nearestPathInfo(x, y) {
  let bestDist = Infinity, bestIdx = 0;
  for (let i = 0; i < PATH.length; i++) {
    const d = Math.hypot(x - PATH[i][0], y - PATH[i][1]);
    if (d < bestDist) { bestDist = d; bestIdx = i; }
  }
  return { dist: bestDist, idx: bestIdx };
}

function reset() {
  car = { x: PATH[0][0], y: PATH[0][1], angle: 0, speed: 0 };
  ai = { x: PATH[2][0], y: PATH[2][1], pathIdx: 2, speed: 1.6 };
  lap = 1;
  checkpointIdx = 0;
  aiCheckpointIdx = 0;
  raceTime = 0;
  lapStartTime = 0;
  finished = false;
  keys = {};
  document.getElementById("lap").textContent = 1;
  document.getElementById("time").textContent = "00.0";
}

window.addEventListener("keydown", (e) => {
  const m = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" };
  if (m[e.code]) { keys[m[e.code]] = true; e.preventDefault(); }
});
window.addEventListener("keyup", (e) => {
  const m = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" };
  if (m[e.code]) { keys[m[e.code]] = false; e.preventDefault(); }
});

function updateCar(dt) {
  if (keys.up) car.speed = Math.min(3.2, car.speed + 0.06);
  else if (keys.down) car.speed = Math.max(-1.2, car.speed - 0.08);
  else car.speed *= 0.985;

  const { dist } = nearestPathInfo(car.x, car.y);
  if (dist > TRACK_HALF_W) car.speed *= 0.92;

  if (Math.abs(car.speed) > 0.15) {
    const turnRate = 0.045 * (car.speed > 0 ? 1 : -1);
    if (keys.left) car.angle -= turnRate;
    if (keys.right) car.angle += turnRate;
  }

  car.x += Math.cos(car.angle) * car.speed;
  car.y += Math.sin(car.angle) * car.speed;
}

function updateAI() {
  const target = PATH[(ai.pathIdx + 3) % PATH.length];
  const dx = target[0] - ai.x, dy = target[1] - ai.y;
  const dist = Math.hypot(dx, dy);
  ai.x += (dx / dist) * ai.speed;
  ai.y += (dy / dist) * ai.speed;
  if (dist < 8) ai.pathIdx = (ai.pathIdx + 1) % PATH.length;

  const cp = CHECKPOINTS[aiCheckpointIdx];
  if (Math.hypot(ai.x - PATH[cp][0], ai.y - PATH[cp][1]) < 30) {
    aiCheckpointIdx = (aiCheckpointIdx + 1) % CHECKPOINTS.length;
  }
}

function checkLap() {
  const cp = CHECKPOINTS[checkpointIdx];
  if (Math.hypot(car.x - PATH[cp][0], car.y - PATH[cp][1]) < 30) {
    checkpointIdx++;
    if (checkpointIdx >= CHECKPOINTS.length) {
      checkpointIdx = 0;
      const lapTime = raceTime - lapStartTime;
      lapStartTime = raceTime;
      if (!bestLap || lapTime < bestLap) {
        bestLap = lapTime;
        localStorage.setItem("jogazone-corridaGP-best", String(bestLap));
        document.getElementById("best").textContent = bestLap.toFixed(1) + "s";
      }
      lap++;
      if (lap > 3) {
        finished = true;
        document.getElementById("lap").textContent = 3;
      } else {
        document.getElementById("lap").textContent = lap;
      }
    }
  }
}

function update(dt) {
  if (finished) return;
  raceTime += dt;
  document.getElementById("time").textContent = raceTime.toFixed(1);
  updateCar(dt);
  updateAI();
  checkLap();
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#3a7a3a";
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = "#2a2f45";
  ctx.lineWidth = TRACK_HALF_W * 2;
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(PATH[0][0], PATH[0][1]);
  PATH.forEach((p) => ctx.lineTo(p[0], p[1]));
  ctx.closePath();
  ctx.stroke();

  ctx.strokeStyle = "rgba(255,255,255,.4)";
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 8]);
  ctx.beginPath();
  ctx.moveTo(PATH[0][0], PATH[0][1]);
  PATH.forEach((p) => ctx.lineTo(p[0], p[1]));
  ctx.closePath();
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "#ffd166";
  const startP = PATH[CHECKPOINTS[0]];
  ctx.fillRect(startP[0] - 4, startP[1] - 4, 8, 8);

  ctx.font = "22px sans-serif";
  ctx.textAlign = "center";
  ctx.save();
  ctx.translate(ai.x, ai.y);
  ctx.fillText("🚗", 0, 0);
  ctx.restore();

  ctx.save();
  ctx.translate(car.x, car.y);
  ctx.rotate(car.angle);
  ctx.font = "24px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("🏎️", 0, 0);
  ctx.restore();

  if (finished) {
    ctx.fillStyle = "rgba(20,24,40,.82)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#eef0fb";
    ctx.font = "bold 20px 'Segoe UI'";
    ctx.textAlign = "center";
    ctx.fillText(`Corrida terminada! ${raceTime.toFixed(1)}s`, W / 2, H / 2 - 10);
    ctx.font = "13px 'Segoe UI'";
    ctx.fillStyle = "rgba(255,255,255,.8)";
    ctx.fillText("Recarrega a página para correr de novo", W / 2, H / 2 + 16);
  }
}

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

loadBest();
reset();
requestAnimationFrame(loop);
