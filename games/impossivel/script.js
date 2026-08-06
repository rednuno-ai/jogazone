const W = 360, H = 640;
const PLAYER_SIZE = 16;
const PLAYER_SPEED = 3.2;
const BALL_RADIUS = 12;

const canvas = document.getElementById("canvas");
canvas.width = W;
canvas.height = H;
const ctx = canvas.getContext("2d");

// Cada banda tem uma linha de bolas que oscilam horizontalmente.
// gap: largura livre entre bolas; count: número de bolas na banda.
const BANDS = [
  { y: 560, count: 3, speed: 1.6, gap: 90 },
  { y: 460, count: 4, speed: -2.0, gap: 70 },
  { y: 360, count: 3, speed: 2.3, gap: 85 },
  { y: 260, count: 4, speed: -1.8, gap: 65 },
  { y: 160, count: 3, speed: 2.6, gap: 80 }
];

const CHECKPOINT_YS = [600, 500, 400, 300, 200, 100];
const GOAL_Y = 60;

let player, checkpointIndex, attempts, balls, keys, running;

function initBalls() {
  balls = BANDS.map((band) => {
    const items = [];
    const span = W - 40;
    const spacing = span / band.count;
    for (let i = 0; i < band.count; i++) {
      items.push({
        x: 20 + spacing * i + (band.speed > 0 ? 0 : spacing / 2),
        y: band.y,
        dir: band.speed > 0 ? 1 : -1,
        speed: Math.abs(band.speed),
        gap: band.gap
      });
    }
    return items;
  });
}

function resetPlayer(toCheckpoint) {
  player = { x: W / 2, y: CHECKPOINT_YS[toCheckpoint] - 20 };
}

function newGame() {
  checkpointIndex = 0;
  attempts = 0;
  keys = { up: false, down: false, left: false, right: false };
  resetPlayer(0);
  initBalls();
  updateHUD();
  document.getElementById("status").textContent = "Chega ao topo sem tocar nas bolas.";
}

function updateHUD() {
  document.getElementById("attempts").textContent = attempts;
  document.getElementById("checkpoint").textContent = checkpointIndex;
}

function onKey(e, isDown) {
  const map = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right", KeyW: "up", KeyS: "down", KeyA: "left", KeyD: "right" };
  const k = map[e.code];
  if (k) { keys[k] = isDown; e.preventDefault(); }
}
window.addEventListener("keydown", (e) => onKey(e, true));
window.addEventListener("keyup", (e) => onKey(e, false));

function die() {
  attempts++;
  updateHUD();
  resetPlayer(checkpointIndex);
}

function update() {
  let dx = 0, dy = 0;
  if (keys.up) dy -= 1;
  if (keys.down) dy += 1;
  if (keys.left) dx -= 1;
  if (keys.right) dx += 1;
  if (dx && dy) { dx *= 0.7071; dy *= 0.7071; }

  player.x = Math.min(W - PLAYER_SIZE / 2, Math.max(PLAYER_SIZE / 2, player.x + dx * PLAYER_SPEED));
  player.y = Math.min(H - PLAYER_SIZE / 2, Math.max(PLAYER_SIZE / 2, player.y + dy * PLAYER_SPEED));

  balls.forEach((band) => {
    band.forEach((b) => {
      b.x += b.dir * b.speed;
      const min = BALL_RADIUS, max = W - BALL_RADIUS;
      if (b.x < min) { b.x = min; b.dir = 1; }
      if (b.x > max) { b.x = max; b.dir = -1; }
    });
  });

  // Colisão jogador-bola
  for (const band of balls) {
    for (const b of band) {
      const dist = Math.hypot(player.x - b.x, player.y - b.y);
      if (dist < BALL_RADIUS + PLAYER_SIZE / 2 - 3) {
        die();
        return;
      }
    }
  }

  // Checkpoints (a subir)
  for (let i = checkpointIndex + 1; i < CHECKPOINT_YS.length; i++) {
    if (player.y <= CHECKPOINT_YS[i]) {
      checkpointIndex = i;
    }
  }
  updateHUD();

  if (player.y <= GOAL_Y) {
    document.getElementById("status").textContent = "🏆 Conseguiste! Vence-te o impossível.";
    running = false;
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#10131f";
  ctx.fillRect(0, 0, W, H);

  // Faixa de meta
  ctx.fillStyle = "rgba(255,209,102,.15)";
  ctx.fillRect(0, 0, W, GOAL_Y);
  ctx.strokeStyle = "#ffd166";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, GOAL_Y);
  ctx.lineTo(W, GOAL_Y);
  ctx.stroke();

  // Checkpoints
  CHECKPOINT_YS.forEach((y, i) => {
    ctx.strokeStyle = i <= checkpointIndex ? "rgba(126,232,181,.6)" : "rgba(255,255,255,.15)";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
    ctx.setLineDash([]);
  });

  // Bolas
  balls.forEach((band) => {
    band.forEach((b) => {
      ctx.fillStyle = "#5da9ff";
      ctx.beginPath();
      ctx.arc(b.x, b.y, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    });
  });

  // Jogador
  ctx.fillStyle = "#ff5d73";
  ctx.fillRect(player.x - PLAYER_SIZE / 2, player.y - PLAYER_SIZE / 2, PLAYER_SIZE, PLAYER_SIZE);
}

function loop() {
  if (running) update();
  draw();
  requestAnimationFrame(loop);
}

document.getElementById("restart-btn").addEventListener("click", () => {
  running = true;
  newGame();
});

running = true;
newGame();
loop();
