const W = 480, H = 520;
const canvas = document.getElementById("canvas");
canvas.width = W; canvas.height = H;
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const waveEl = document.getElementById("wave");

const PLAYER_SPEED = 260;
const BULLET_SPEED = 380;
const ENEMY_BULLET_SPEED = 180;
const PLAYER_COOLDOWN = 0.35;

let player, bullets, enemyBullets, enemies, enemyDir, enemyStepTimer, score, lives, wave, over, keys, shootCooldown;

function reset() {
  player = { x: W / 2 - 18, y: H - 50, w: 36, h: 20 };
  bullets = [];
  enemyBullets = [];
  score = 0;
  lives = 3;
  wave = 1;
  over = false;
  keys = {};
  shootCooldown = 0;
  scoreEl.textContent = 0;
  livesEl.textContent = lives;
  waveEl.textContent = wave;
  spawnWave();
}

function spawnWave() {
  enemies = [];
  const cols = 7, rows = 3 + Math.min(2, Math.floor(wave / 3));
  const spacing = 48;
  const startX = (W - (cols - 1) * spacing) / 2;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      enemies.push({ x: startX + c * spacing, y: 40 + r * 40, w: 28, h: 20, alive: true });
    }
  }
  enemyDir = 1;
  enemyStepTimer = Math.max(0.15, 0.6 - wave * 0.03);
  waveEl.textContent = wave;
}

window.addEventListener("keydown", (e) => {
  keys[e.code] = true;
  if (e.code === "Space") e.preventDefault();
});
window.addEventListener("keyup", (e) => { keys[e.code] = false; });

function update(dt) {
  if (over) return;

  if (keys["ArrowLeft"] || keys["KeyA"]) player.x -= PLAYER_SPEED * dt;
  if (keys["ArrowRight"] || keys["KeyD"]) player.x += PLAYER_SPEED * dt;
  player.x = Math.max(0, Math.min(W - player.w, player.x));

  shootCooldown -= dt;
  if (keys["Space"] && shootCooldown <= 0) {
    bullets.push({ x: player.x + player.w / 2 - 2, y: player.y, w: 4, h: 10 });
    shootCooldown = PLAYER_COOLDOWN;
  }

  bullets.forEach((b) => { b.y -= BULLET_SPEED * dt; });
  bullets = bullets.filter((b) => b.y > -20);

  enemyBullets.forEach((b) => { b.y += ENEMY_BULLET_SPEED * dt; });
  enemyBullets = enemyBullets.filter((b) => b.y < H + 20);

  enemyStepTimer -= dt;
  if (enemyStepTimer <= 0) {
    const alive = enemies.filter((e) => e.alive);
    let hitEdge = false;
    alive.forEach((e) => {
      e.x += enemyDir * 14;
      if (e.x < 0 || e.x + e.w > W) hitEdge = true;
    });
    if (hitEdge) {
      enemyDir *= -1;
      alive.forEach((e) => { e.y += 18; });
    }
    enemyStepTimer = Math.max(0.12, 0.6 - wave * 0.03);

    if (Math.random() < 0.5 && alive.length) {
      const shooter = alive[Math.floor(Math.random() * alive.length)];
      enemyBullets.push({ x: shooter.x + shooter.w / 2 - 2, y: shooter.y + shooter.h, w: 4, h: 10 });
    }
  }

  for (const b of bullets) {
    for (const e of enemies) {
      if (!e.alive) continue;
      if (b.x < e.x + e.w && b.x + b.w > e.x && b.y < e.y + e.h && b.y + b.h > e.y) {
        e.alive = false;
        b.y = -999;
        score += 10;
        scoreEl.textContent = score;
      }
    }
  }
  bullets = bullets.filter((b) => b.y > -900);

  for (const b of enemyBullets) {
    if (b.x < player.x + player.w && b.x + b.w > player.x && b.y < player.y + player.h && b.y + b.h > player.y) {
      b.y = H + 999;
      loseLife();
    }
  }

  enemies.forEach((e) => {
    if (e.alive && e.y + e.h >= player.y) {
      loseLife();
      e.alive = false;
    }
  });

  if (enemies.every((e) => !e.alive)) {
    wave++;
    spawnWave();
  }
}

function loseLife() {
  lives--;
  livesEl.textContent = lives;
  if (lives <= 0) {
    over = true;
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#05070f";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#5da9ff";
  ctx.fillRect(player.x, player.y, player.w, player.h);

  ctx.fillStyle = "#ffd166";
  bullets.forEach((b) => ctx.fillRect(b.x, b.y, b.w, b.h));

  ctx.fillStyle = "#ff5d73";
  enemyBullets.forEach((b) => ctx.fillRect(b.x, b.y, b.w, b.h));

  ctx.fillStyle = "#7ee8b5";
  enemies.forEach((e) => {
    if (e.alive) ctx.fillRect(e.x, e.y, e.w, e.h);
  });

  if (over) {
    ctx.fillStyle = "rgba(20,24,40,.85)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#eef0fb";
    ctx.font = "bold 22px 'Segoe UI'";
    ctx.textAlign = "center";
    ctx.fillText(`Fim de jogo! ${score} pontos`, W / 2, H / 2 - 10);
    ctx.font = "14px 'Segoe UI'";
    ctx.fillText("Recarrega a página para jogares de novo", W / 2, H / 2 + 18);
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
