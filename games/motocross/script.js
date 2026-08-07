const W = 500, H = 260;
const canvas = document.getElementById("canvas");
canvas.width = W; canvas.height = H;
const ctx = canvas.getContext("2d");

const PLAYER_X = 110;
const BASE_Y = 190;
const GRAVITY = 0.45;

function terrainHeightAt(worldX) {
  return BASE_Y
    + Math.sin(worldX * 0.007) * 30
    + Math.sin(worldX * 0.02) * 12;
}

function slopeAt(worldX) {
  return terrainHeightAt(worldX + 1) - terrainHeightAt(worldX);
}

let worldX, speed, jumping, jumpY, jumpVy, airRotation, combo, ramps, rampAt, obstacles, spawnAt, distance, best, running;

function loadBest() {
  best = Number(localStorage.getItem("jogazone-motocross-best") || 0);
  document.getElementById("best").textContent = best;
}

function reset() {
  worldX = 0;
  speed = 2;
  jumping = false;
  jumpY = 0;
  jumpVy = 0;
  airRotation = 0;
  combo = 0;
  obstacles = [];
  spawnAt = 260;
  rampAt = 380;
  distance = 0;
  running = true;
  document.getElementById("score").textContent = 0;
  document.getElementById("combo").textContent = 0;
}

const keys = {};
window.addEventListener("keydown", (e) => {
  if (!running) { if (e.code === "Space") reset(); return; }
  if (e.code === "ArrowUp") { keys.up = true; e.preventDefault(); }
  if (e.code === "ArrowLeft") { keys.left = true; e.preventDefault(); }
  if (e.code === "ArrowRight") { keys.right = true; e.preventDefault(); }
});
window.addEventListener("keyup", (e) => {
  if (e.code === "ArrowUp") keys.up = false;
  if (e.code === "ArrowLeft") keys.left = false;
  if (e.code === "ArrowRight") keys.right = false;
});

function spawnObstacle() {
  obstacles.push({ worldX: worldX + spawnAt, hit: false });
}

function update() {
  if (!running) return;

  const slope = slopeAt(worldX + PLAYER_X);
  if (keys.up) speed = Math.min(8, speed + 0.12);
  else speed = Math.max(1, speed - 0.05);
  speed = Math.max(1, speed - slope * 0.06);

  worldX += speed;
  distance = worldX / 12;
  document.getElementById("score").textContent = Math.floor(distance);

  spawnAt -= speed;
  if (spawnAt <= 0) { spawnObstacle(); spawnAt = 200 + Math.random() * 200; }

  rampAt -= speed;
  if (!jumping && rampAt <= 0) {
    if (speed > 3.5) {
      jumping = true;
      jumpVy = -speed * 1.05;
      airRotation = 0;
    }
    rampAt = 320 + Math.random() * 260;
  }

  if (jumping) {
    if (keys.left) airRotation -= 6;
    if (keys.right) airRotation += 6;
    jumpVy += GRAVITY;
    jumpY += jumpVy;
    if (jumpY >= 0) {
      jumpY = 0;
      jumping = false;
      const normalized = ((airRotation % 360) + 360) % 360;
      const closeToLevel = normalized < 35 || normalized > 325;
      if (closeToLevel) {
        const spins = Math.round(Math.abs(airRotation) / 360);
        if (spins > 0) {
          combo += spins;
          document.getElementById("combo").textContent = combo;
        }
      } else {
        running = false;
      }
    }
  }

  obstacles = obstacles.filter((o) => o.worldX > worldX - 40);
  if (!jumping || jumpY > -22) {
    for (const o of obstacles) {
      const screenX = o.worldX - worldX;
      if (!o.hit && screenX > PLAYER_X - 16 && screenX < PLAYER_X + 16) {
        if (!jumping) running = false;
        o.hit = true;
      }
    }
  } else {
    obstacles.forEach((o) => {
      const screenX = o.worldX - worldX;
      if (screenX > PLAYER_X - 16 && screenX < PLAYER_X + 16) o.hit = true;
    });
  }

  if (!running && Math.floor(distance) > best) {
    best = Math.floor(distance);
    localStorage.setItem("jogazone-motocross-best", String(best));
    document.getElementById("best").textContent = best;
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#e8b878";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#a86a3a";
  ctx.beginPath();
  ctx.moveTo(0, H);
  for (let x = 0; x <= W; x += 6) ctx.lineTo(x, terrainHeightAt(worldX + x));
  ctx.lineTo(W, H);
  ctx.closePath();
  ctx.fill();

  obstacles.forEach((o) => {
    const screenX = o.worldX - worldX;
    if (screenX < -20 || screenX > W + 20) return;
    const y = terrainHeightAt(o.worldX);
    ctx.font = "24px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🪨", screenX, y);
  });

  const groundY = terrainHeightAt(worldX + PLAYER_X);
  const playerY = groundY + jumpY;
  ctx.save();
  ctx.translate(PLAYER_X, playerY - 10);
  ctx.rotate((airRotation * Math.PI) / 180);
  ctx.font = "32px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("🏍️", 0, 0);
  ctx.restore();

  if (!running) {
    ctx.fillStyle = "rgba(20,24,40,.8)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#eef0fb";
    ctx.font = "bold 18px 'Segoe UI'";
    ctx.textAlign = "center";
    ctx.fillText(`Caíste! ${Math.floor(distance)}m`, W / 2, H / 2 - 10);
    ctx.font = "13px 'Segoe UI'";
    ctx.fillStyle = "rgba(255,255,255,.85)";
    ctx.fillText("Prime ESPAÇO para tentares de novo", W / 2, H / 2 + 16);
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loadBest();
reset();
loop();
