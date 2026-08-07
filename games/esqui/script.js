const W = 320, H = 520;
const canvas = document.getElementById("canvas");
canvas.width = W; canvas.height = H;
const ctx = canvas.getContext("2d");

let player, obstacles, speed, distance, gatesPass, best, running, spawnTimer, keys;

function loadBest() {
  best = Number(localStorage.getItem("jogazone-esqui-best") || 0);
  document.getElementById("best").textContent = best;
}

function reset() {
  player = { x: W / 2, vx: 0 };
  obstacles = [];
  speed = 3.5;
  distance = 0;
  gatesPass = 0;
  running = true;
  spawnTimer = 0;
  keys = {};
  document.getElementById("score").textContent = 0;
  document.getElementById("gates").textContent = 0;
}

window.addEventListener("keydown", (e) => {
  if (e.code === "ArrowLeft") { keys.left = true; e.preventDefault(); }
  if (e.code === "ArrowRight") { keys.right = true; e.preventDefault(); }
});
window.addEventListener("keyup", (e) => {
  if (e.code === "ArrowLeft") keys.left = false;
  if (e.code === "ArrowRight") keys.right = false;
});

function spawnObstacle() {
  const isGate = Math.random() < 0.55;
  if (isGate) {
    const gapCenter = 60 + Math.random() * (W - 120);
    obstacles.push({ type: "gate", y: -30, gapCenter, gapWidth: 70, passed: false });
  } else {
    obstacles.push({ type: "tree", y: -30, x: 20 + Math.random() * (W - 40) });
  }
}

function reset_click() { if (!running) reset(); }
canvas.addEventListener("click", reset_click);

function update() {
  if (!running) return;
  distance += speed / 8;
  speed = Math.min(9, 3.5 + distance / 350);
  document.getElementById("score").textContent = Math.floor(distance);

  if (keys.left) player.vx -= 0.5;
  if (keys.right) player.vx += 0.5;
  player.vx *= 0.9;
  player.x += player.vx;
  player.x = Math.max(16, Math.min(W - 16, player.x));

  spawnTimer--;
  if (spawnTimer <= 0) {
    spawnObstacle();
    spawnTimer = Math.max(28, 55 - distance / 25);
  }

  obstacles.forEach((o) => (o.y += speed));
  obstacles = obstacles.filter((o) => o.y < H + 40);

  for (const o of obstacles) {
    if (o.type === "tree") {
      if (Math.abs(o.y - (H - 80)) < 20 && Math.abs(o.x - player.x) < 18) {
        endGame();
      }
    } else if (o.type === "gate" && !o.passed && o.y > H - 90 && o.y < H - 70) {
      o.passed = true;
      const inGap = player.x > o.gapCenter - o.gapWidth / 2 && player.x < o.gapCenter + o.gapWidth / 2;
      if (inGap) {
        gatesPass++;
        document.getElementById("gates").textContent = gatesPass;
      }
    }
  }
}

function endGame() {
  running = false;
  if (Math.floor(distance) > best) {
    best = Math.floor(distance);
    localStorage.setItem("jogazone-esqui-best", String(best));
    document.getElementById("best").textContent = best;
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#eaf4fb";
  ctx.fillRect(0, 0, W, H);

  obstacles.forEach((o) => {
    if (o.type === "tree") {
      ctx.font = "30px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("🌲", o.x, o.y);
    } else {
      const leftX = o.gapCenter - o.gapWidth / 2;
      const rightX = o.gapCenter + o.gapWidth / 2;
      ctx.fillStyle = "#ff5d73";
      ctx.fillRect(leftX - 3, o.y - 14, 6, 28);
      ctx.fillStyle = "#5da9ff";
      ctx.fillRect(rightX - 3, o.y - 14, 6, 28);
    }
  });

  ctx.font = "32px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("⛷️", player.x, H - 70);

  if (!running) {
    ctx.fillStyle = "rgba(20,24,40,.8)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#eef0fb";
    ctx.font = "bold 18px 'Segoe UI'";
    ctx.fillText(`Caíste! ${Math.floor(distance)}m, ${gatesPass} portas`, W / 2, H / 2 - 10);
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

loadBest();
reset();
loop();
