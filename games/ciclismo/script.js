const W = 500, H = 260;
const canvas = document.getElementById("canvas");
canvas.width = W; canvas.height = H;
const ctx = canvas.getContext("2d");

const PLAYER_X = 110;
const BASE_Y = 190;
const GRAVITY = 0.5;

function terrainHeightAt(worldX) {
  return BASE_Y
    + Math.sin(worldX * 0.006) * 34
    + Math.sin(worldX * 0.017) * 14
    + Math.sin(worldX * 0.041) * 6;
}

function slopeAt(worldX) {
  return terrainHeightAt(worldX + 1) - terrainHeightAt(worldX);
}

let worldX, speed, pedalPower, lastKey, jumpVy, jumping, obstacles, spawnAt, distance, best, running, keysHeld;

function loadBest() {
  best = Number(localStorage.getItem("jogazone-ciclismo-best") || 0);
  document.getElementById("best").textContent = best;
}

function reset() {
  worldX = 0;
  speed = 2.5;
  pedalPower = 0;
  lastKey = null;
  jumpVy = 0;
  jumping = false;
  obstacles = [];
  spawnAt = 300;
  distance = 0;
  running = true;
  keysHeld = {};
  document.getElementById("score").textContent = 0;
  document.getElementById("speed").textContent = 0;
}

window.addEventListener("keydown", (e) => {
  if (!running) { if (e.code === "Space") reset(); return; }
  if (e.code === "ArrowLeft" || e.code === "ArrowRight") {
    if (e.code !== lastKey) {
      pedalPower = Math.min(6, pedalPower + 1.4);
      lastKey = e.code;
    }
    e.preventDefault();
  }
  if (e.code === "Space") {
    if (!jumping) { jumping = true; jumpVy = -8.5; }
    e.preventDefault();
  }
});

function spawnObstacle() {
  const kind = Math.random() < 0.5 ? "rock" : "hole";
  obstacles.push({ worldX: worldX + spawnAt, kind, hit: false });
}

function update() {
  if (!running) return;

  const slope = slopeAt(worldX + PLAYER_X);
  const slopeFactor = -slope * 0.12;
  pedalPower *= 0.965;
  speed = Math.max(1.2, Math.min(9, 2.2 + pedalPower + slopeFactor));

  worldX += speed;
  distance = worldX / 12;
  document.getElementById("score").textContent = Math.floor(distance);
  document.getElementById("speed").textContent = speed.toFixed(1);

  if (jumping) {
    jumpVy += GRAVITY;
  } else {
    jumpVy = 0;
  }

  spawnAt -= speed;
  if (spawnAt <= 0) {
    spawnObstacle();
    spawnAt = 220 + Math.random() * 180;
  }

  obstacles = obstacles.filter((o) => o.worldX > worldX - 40);

  for (const o of obstacles) {
    const screenX = o.worldX - worldX;
    if (!o.hit && screenX > PLAYER_X - 16 && screenX < PLAYER_X + 16) {
      const groundY = terrainHeightAt(o.worldX);
      const playerAirY = jumping ? groundY + jumpOffsetAt() : groundY;
      const clearance = groundY - playerAirY;
      if (clearance < 22) {
        running = false;
        if (Math.floor(distance) > best) {
          best = Math.floor(distance);
          localStorage.setItem("jogazone-ciclismo-best", String(best));
          document.getElementById("best").textContent = best;
        }
      }
      o.hit = true;
    }
  }
}

let jumpY = 0;
function jumpOffsetAt() {
  return jumpY;
}

function updateJump() {
  if (jumping) {
    jumpY += jumpVy;
    if (jumpY >= 0) { jumpY = 0; jumping = false; jumpVy = 0; }
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#7bb8e8";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#5a9a4a";
  ctx.beginPath();
  ctx.moveTo(0, H);
  for (let x = 0; x <= W; x += 6) {
    ctx.lineTo(x, terrainHeightAt(worldX + x));
  }
  ctx.lineTo(W, H);
  ctx.closePath();
  ctx.fill();

  obstacles.forEach((o) => {
    const screenX = o.worldX - worldX;
    if (screenX < -20 || screenX > W + 20) return;
    const y = terrainHeightAt(o.worldX);
    ctx.font = "24px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(o.kind === "rock" ? "🪨" : "🕳️", screenX, y);
  });

  const groundY = terrainHeightAt(worldX + PLAYER_X);
  const playerY = groundY + jumpY;
  ctx.font = "34px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("🚴", PLAYER_X, playerY - 8);

  if (!running) {
    ctx.fillStyle = "rgba(20,24,40,.8)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#eef0fb";
    ctx.font = "bold 18px 'Segoe UI'";
    ctx.fillText(`Caíste! ${Math.floor(distance)}m`, W / 2, H / 2 - 10);
    ctx.font = "13px 'Segoe UI'";
    ctx.fillStyle = "rgba(255,255,255,.85)";
    ctx.fillText("Prime ESPAÇO para tentares de novo", W / 2, H / 2 + 16);
  }
}

function loop() {
  update();
  updateJump();
  draw();
  requestAnimationFrame(loop);
}

loadBest();
reset();
loop();
