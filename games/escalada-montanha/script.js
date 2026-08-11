const W = 320, H = 480;
const canvas = document.getElementById("canvas");
canvas.width = W; canvas.height = H;
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");

const GRAVITY = 900;
const BOUNCE_VY = -520;
const MOVE_SPEED = 220;
const PLAT_W = 60, PLAT_H = 12;
const PLAYER_R = 14;

let player, platforms, cameraY, keys, startY, best, over;

function reset() {
  player = { x: W / 2, y: 400, vy: 0, vx: 0 };
  startY = player.y;
  cameraY = player.y - H * 0.6;
  keys = {};
  over = false;
  best = parseInt(localStorage.getItem("jogazone-escalada-best") || "0", 10);
  bestEl.textContent = best;
  scoreEl.textContent = 0;

  platforms = [];
  platforms.push({ x: W / 2 - PLAT_W / 2, y: 430 });
  let y = 430;
  while (y > -600) {
    y -= 60 + Math.random() * 40;
    platforms.push({ x: Math.random() * (W - PLAT_W), y });
  }
}

window.addEventListener("keydown", (e) => {
  keys[e.code] = true;
  if (e.code.startsWith("Arrow")) e.preventDefault();
});
window.addEventListener("keyup", (e) => { keys[e.code] = false; });

function heightScore() {
  return Math.max(0, Math.round((startY - player.y) / 10));
}

function ensurePlatforms() {
  const topmost = Math.min(...platforms.map((p) => p.y));
  if (topmost > cameraY - 100) {
    let y = topmost;
    while (y > cameraY - 300) {
      y -= 60 + Math.random() * 40;
      platforms.push({ x: Math.random() * (W - PLAT_W), y });
    }
  }
  platforms = platforms.filter((p) => p.y < cameraY + H + 100);
}

function update(dt) {
  if (over) return;

  if (keys["ArrowLeft"]) player.vx = -MOVE_SPEED;
  else if (keys["ArrowRight"]) player.vx = MOVE_SPEED;
  else player.vx = 0;

  player.vy += GRAVITY * dt;
  player.x += player.vx * dt;
  player.y += player.vy * dt;

  if (player.x < -PLAYER_R) player.x = W + PLAYER_R;
  if (player.x > W + PLAYER_R) player.x = -PLAYER_R;

  if (player.vy > 0) {
    for (const p of platforms) {
      if (player.x + PLAYER_R > p.x && player.x - PLAYER_R < p.x + PLAT_W &&
          player.y + PLAYER_R > p.y && player.y + PLAYER_R < p.y + PLAT_H + 14 &&
          player.vy > 0) {
        player.vy = BOUNCE_VY;
        player.y = p.y - PLAYER_R;
        break;
      }
    }
  }

  cameraY = Math.min(cameraY, player.y - H * 0.6);
  ensurePlatforms();

  const score = heightScore();
  scoreEl.textContent = score;

  if (player.y - cameraY > H + 60) {
    over = true;
    if (score > best) {
      best = score;
      bestEl.textContent = best;
      localStorage.setItem("jogazone-escalada-best", String(best));
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#10131f";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#7ee8b5";
  platforms.forEach((p) => {
    const screenY = p.y - cameraY;
    if (screenY > -20 && screenY < H + 20) {
      ctx.fillRect(p.x, screenY, PLAT_W, PLAT_H);
    }
  });

  ctx.fillStyle = "#ffd166";
  ctx.beginPath();
  ctx.arc(player.x, player.y - cameraY, PLAYER_R, 0, Math.PI * 2);
  ctx.fill();

  if (over) {
    ctx.fillStyle = "rgba(20,24,40,.85)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#eef0fb";
    ctx.font = "bold 20px 'Segoe UI'";
    ctx.textAlign = "center";
    ctx.fillText(`Caíste! ${heightScore()}m`, W / 2, H / 2 - 10);
    ctx.font = "13px 'Segoe UI'";
    ctx.fillText("Recarrega a página para jogares de novo", W / 2, H / 2 + 16);
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

reset();
requestAnimationFrame(loop);
