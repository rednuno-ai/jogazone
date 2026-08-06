const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const W = canvas.width, H = canvas.height;

const PADDLE_W = 84, PADDLE_H = 12;
const BALL_R = 7;
const ROWS = 5, COLS = 8;
const BRICK_W = 46, BRICK_H = 16, BRICK_GAP = 4, BRICK_TOP = 40;
const BRICK_COLORS = ["#ff5d73", "#ffd166", "#7ee8b5", "#5da9ff", "#c58bff"];

let paddleX, ball, bricks, score, lives, running, animId;

function initBricks() {
  bricks = [];
  const totalWidth = COLS * (BRICK_W + BRICK_GAP) - BRICK_GAP;
  const startX = (W - totalWidth) / 2;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      bricks.push({
        x: startX + c * (BRICK_W + BRICK_GAP),
        y: BRICK_TOP + r * (BRICK_H + BRICK_GAP),
        alive: true,
        color: BRICK_COLORS[r % BRICK_COLORS.length]
      });
    }
  }
}

function resetBall() {
  ball = { x: W / 2, y: H - 50, vx: 3.2 * (Math.random() < 0.5 ? -1 : 1), vy: -3.6 };
}

function reset() {
  paddleX = W / 2 - PADDLE_W / 2;
  score = 0;
  lives = 3;
  running = true;
  document.getElementById("score").textContent = score;
  document.getElementById("lives").textContent = lives;
  initBricks();
  resetBall();
  cancelAnimationFrame(animId);
  loop();
}

function movePaddle(clientX) {
  const rect = canvas.getBoundingClientRect();
  const scale = W / rect.width;
  const x = (clientX - rect.left) * scale;
  paddleX = Math.min(Math.max(x - PADDLE_W / 2, 0), W - PADDLE_W);
}

canvas.addEventListener("mousemove", (e) => movePaddle(e.clientX));
canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  movePaddle(e.touches[0].clientX);
}, { passive: false });

function update() {
  if (!running) return;

  ball.x += ball.vx;
  ball.y += ball.vy;

  if (ball.x - BALL_R < 0 || ball.x + BALL_R > W) ball.vx *= -1;
  if (ball.y - BALL_R < 0) ball.vy *= -1;

  const paddleY = H - 24;
  if (
    ball.y + BALL_R >= paddleY &&
    ball.y + BALL_R <= paddleY + PADDLE_H &&
    ball.x >= paddleX &&
    ball.x <= paddleX + PADDLE_W &&
    ball.vy > 0
  ) {
    const hitPos = (ball.x - (paddleX + PADDLE_W / 2)) / (PADDLE_W / 2);
    ball.vx = hitPos * 4.5;
    ball.vy = -Math.abs(ball.vy);
  }

  if (ball.y - BALL_R > H) {
    lives--;
    document.getElementById("lives").textContent = lives;
    if (lives <= 0) {
      running = false;
      setTimeout(() => alert(`Fim de jogo! Pontuação: ${score}`), 50);
      return;
    }
    resetBall();
  }

  for (const b of bricks) {
    if (!b.alive) continue;
    if (
      ball.x + BALL_R > b.x &&
      ball.x - BALL_R < b.x + BRICK_W &&
      ball.y + BALL_R > b.y &&
      ball.y - BALL_R < b.y + BRICK_H
    ) {
      b.alive = false;
      ball.vy *= -1;
      score += 10;
      document.getElementById("score").textContent = score;
      break;
    }
  }

  if (bricks.every((b) => !b.alive)) {
    running = false;
    setTimeout(() => alert(`Venceste! Pontuação: ${score}`), 50);
  }
}

function draw() {
  ctx.fillStyle = "#161a2e";
  ctx.fillRect(0, 0, W, H);

  bricks.forEach((b) => {
    if (!b.alive) return;
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.roundRect(b.x, b.y, BRICK_W, BRICK_H, 4);
    ctx.fill();
  });

  ctx.fillStyle = "#eef0fb";
  ctx.beginPath();
  ctx.roundRect(paddleX, H - 24, PADDLE_W, PADDLE_H, 6);
  ctx.fill();

  ctx.fillStyle = "#ff5d73";
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
  ctx.fill();
}

function loop() {
  update();
  draw();
  if (running) animId = requestAnimationFrame(loop);
}

document.getElementById("restart-btn").addEventListener("click", reset);
reset();
