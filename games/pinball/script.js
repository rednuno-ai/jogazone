const W = 300, H = 500;
const canvas = document.getElementById("canvas");
canvas.width = W; canvas.height = H;
const ctx = canvas.getContext("2d");

const GRAVITY = 0.22;
const BALL_R = 8;
const BUMPERS = [
  { x: 90, y: 140, r: 18, color: "#ff5d73" },
  { x: 210, y: 140, r: 18, color: "#5da9ff" },
  { x: 150, y: 220, r: 18, color: "#7ee8b5" }
];

const LEFT_PIVOT = { x: 90, y: 430 };
const RIGHT_PIVOT = { x: 210, y: 430 };
const FLIPPER_LEN = 50;

let ball, launching, launchPower, score, best, balls, leftActive, rightActive, gameOver;

function loadBest() {
  best = Number(localStorage.getItem("jogazone-pinball-best") || 0);
  document.getElementById("best").textContent = best;
}

function resetBall() {
  ball = { x: W - 20, y: H - 40, vx: 0, vy: 0, launched: false };
}

function reset() {
  score = 0;
  balls = 3;
  gameOver = false;
  launchPower = 0;
  launching = false;
  document.getElementById("score").textContent = 0;
  document.getElementById("balls").textContent = balls;
  resetBall();
}

window.addEventListener("keydown", (e) => {
  if (e.code === "KeyA") { leftActive = true; e.preventDefault(); }
  if (e.code === "KeyL") { rightActive = true; e.preventDefault(); }
  if (e.code === "Space" && !ball.launched && !launching) { launching = true; launchPower = 0; e.preventDefault(); }
});
window.addEventListener("keyup", (e) => {
  if (e.code === "KeyA") leftActive = false;
  if (e.code === "KeyL") rightActive = false;
  if (e.code === "Space" && launching) {
    launching = false;
    ball.vy = -(6 + launchPower * 0.12);
    ball.vx = -1.5;
    ball.launched = true;
    e.preventDefault();
  }
});

function loseBall() {
  balls--;
  document.getElementById("balls").textContent = balls;
  if (balls <= 0) {
    gameOver = true;
    if (score > best) {
      best = score;
      localStorage.setItem("jogazone-pinball-best", String(best));
      document.getElementById("best").textContent = best;
    }
    setTimeout(() => alert(`Fim de jogo! Pontuação: ${score}`), 100);
  } else {
    resetBall();
  }
}

function update() {
  if (gameOver) return;
  if (launching) launchPower = Math.min(100, launchPower + 2);

  if (!ball.launched) return;

  ball.vy += GRAVITY;
  ball.x += ball.vx;
  ball.y += ball.vy;

  if (ball.x < BALL_R) { ball.x = BALL_R; ball.vx *= -0.8; }
  if (ball.x > W - BALL_R) { ball.x = W - BALL_R; ball.vx *= -0.8; }
  if (ball.y < BALL_R) { ball.y = BALL_R; ball.vy *= -0.8; }

  BUMPERS.forEach((b) => {
    const dist = Math.hypot(ball.x - b.x, ball.y - b.y);
    if (dist < b.r + BALL_R) {
      const nx = (ball.x - b.x) / dist, ny = (ball.y - b.y) / dist;
      ball.vx = nx * 5.5;
      ball.vy = ny * 5.5;
      score += 20;
      document.getElementById("score").textContent = score;
    }
  });

  [{ pivot: LEFT_PIVOT, active: leftActive, dir: 1 }, { pivot: RIGHT_PIVOT, active: rightActive, dir: -1 }].forEach(({ pivot, active, dir }) => {
    const dist = Math.hypot(ball.x - pivot.x, ball.y - pivot.y);
    if (active && dist < FLIPPER_LEN && ball.y > pivot.y - 30 && ball.y < pivot.y + 20) {
      ball.vy = -8;
      ball.vx = dir * -4 + (ball.x - pivot.x) * 0.15;
    }
  });

  if (ball.y > H + 20) loseBall();
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#10131f";
  ctx.fillRect(0, 0, W, H);

  BUMPERS.forEach((b) => {
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.strokeStyle = leftActive ? "#ffd166" : "#eef0fb";
  ctx.lineWidth = 8;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(LEFT_PIVOT.x, LEFT_PIVOT.y);
  const la = leftActive ? -0.5 : 0.5;
  ctx.lineTo(LEFT_PIVOT.x + Math.cos(Math.PI - la) * FLIPPER_LEN, LEFT_PIVOT.y + Math.sin(Math.PI - la) * FLIPPER_LEN * 0.4);
  ctx.stroke();

  ctx.strokeStyle = rightActive ? "#ffd166" : "#eef0fb";
  ctx.beginPath();
  ctx.moveTo(RIGHT_PIVOT.x, RIGHT_PIVOT.y);
  const ra = rightActive ? 0.5 : -0.5;
  ctx.lineTo(RIGHT_PIVOT.x + Math.cos(ra) * FLIPPER_LEN, RIGHT_PIVOT.y + Math.sin(ra) * FLIPPER_LEN * 0.4);
  ctx.stroke();

  if (launching) {
    ctx.fillStyle = "rgba(255,255,255,.15)";
    ctx.fillRect(W - 16, H - 100, 8, 60);
    ctx.fillStyle = "#ffd166";
    ctx.fillRect(W - 16, H - 40 - launchPower * 0.6, 8, launchPower * 0.6);
  }

  ctx.fillStyle = "#eef0fb";
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
  ctx.fill();
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loadBest();
reset();
loop();
