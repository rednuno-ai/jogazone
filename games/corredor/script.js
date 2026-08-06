const W = 500, H = 260;
const canvas = document.getElementById("canvas");
canvas.width = W; canvas.height = H;
const ctx = canvas.getContext("2d");
const GROUND_Y = H - 40;
const GRAVITY = 0.85;
const JUMP_VEL = -14;

let player, obstacles, speed, distance, best, running, spawnTimer;

function loadBest() {
  best = Number(localStorage.getItem("jogazone-corredor-best") || 0);
  document.getElementById("best").textContent = best;
}

function reset() {
  player = { x: 60, y: GROUND_Y - 28, vy: 0, size: 28, onGround: true };
  obstacles = [];
  speed = 5;
  distance = 0;
  running = true;
  spawnTimer = 60;
  document.getElementById("score").textContent = 0;
}

function jump() {
  if (!running) { reset(); return; }
  if (player.onGround) { player.vy = JUMP_VEL; player.onGround = false; }
}

window.addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.code === "ArrowUp") { e.preventDefault(); jump(); }
});
canvas.addEventListener("click", jump);

function spawnObstacle() {
  const tall = Math.random() < 0.3;
  obstacles.push({ x: W + 20, w: tall ? 22 : 26, h: tall ? 46 : 28 });
}

function update() {
  if (!running) return;
  distance += speed / 10;
  speed = Math.min(13, 5 + distance / 60);
  document.getElementById("score").textContent = Math.floor(distance);

  player.vy += GRAVITY;
  player.y += player.vy;
  if (player.y >= GROUND_Y - player.size) {
    player.y = GROUND_Y - player.size;
    player.vy = 0;
    player.onGround = true;
  }

  spawnTimer -= 1;
  if (spawnTimer <= 0) {
    spawnObstacle();
    spawnTimer = Math.max(45, 100 - distance / 5);
  }

  obstacles.forEach((o) => (o.x -= speed));
  obstacles = obstacles.filter((o) => o.x + o.w > 0);

  for (const o of obstacles) {
    const px1 = player.x, px2 = player.x + player.size;
    const py1 = player.y, py2 = player.y + player.size;
    const ox1 = o.x, ox2 = o.x + o.w;
    const oy1 = GROUND_Y - o.h, oy2 = GROUND_Y;
    if (px2 > ox1 && px1 < ox2 && py2 > oy1 && py1 < oy2) {
      running = false;
      if (Math.floor(distance) > best) {
        best = Math.floor(distance);
        localStorage.setItem("jogazone-corredor-best", String(best));
        document.getElementById("best").textContent = best;
      }
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#1a2440";
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = "rgba(255,255,255,.3)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.lineTo(W, GROUND_Y);
  ctx.stroke();

  ctx.fillStyle = "#ff5d73";
  ctx.beginPath();
  ctx.roundRect(player.x, player.y, player.size, player.size, 6);
  ctx.fill();

  ctx.fillStyle = "#7ee8b5";
  obstacles.forEach((o) => {
    ctx.fillRect(o.x, GROUND_Y - o.h, o.w, o.h);
  });

  if (!running) {
    ctx.fillStyle = "rgba(16,19,31,.8)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#eef0fb";
    ctx.font = "bold 20px 'Segoe UI'";
    ctx.textAlign = "center";
    ctx.fillText(`Fim de jogo! ${Math.floor(distance)}m`, W / 2, H / 2 - 10);
    ctx.font = "13px 'Segoe UI'";
    ctx.fillStyle = "rgba(255,255,255,.7)";
    ctx.fillText("Clica ou prime espaço para recomeçar", W / 2, H / 2 + 16);
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
