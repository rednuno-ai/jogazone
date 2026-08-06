const W = 420, H = 340;
const canvas = document.getElementById("canvas");
canvas.width = W; canvas.height = H;
const ctx = canvas.getContext("2d");
const GRAVITY = 0.35;
const BALL_START = { x: 70, y: H - 50 };
const HOOP = { x: 340, y: 110, w: 46 };

let ball, dragging, dragStart, score, best, timeLeft, running, scoredThisFlight, timerId;

function loadBest() {
  best = Number(localStorage.getItem("jogazone-basquete-best") || 0);
  document.getElementById("best").textContent = best;
}

function resetBall() {
  ball = { x: BALL_START.x, y: BALL_START.y, vx: 0, vy: 0, flying: false };
  scoredThisFlight = false;
}

function start() {
  score = 0;
  timeLeft = 40;
  running = true;
  resetBall();
  document.getElementById("score").textContent = 0;
  document.getElementById("timer").textContent = timeLeft;
  clearInterval(timerId);
  timerId = setInterval(() => {
    timeLeft--;
    document.getElementById("timer").textContent = timeLeft;
    if (timeLeft <= 0) endGame();
  }, 1000);
}

function endGame() {
  running = false;
  clearInterval(timerId);
  if (score > best) {
    best = score;
    localStorage.setItem("jogazone-basquete-best", String(best));
    document.getElementById("best").textContent = best;
  }
}

function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = W / rect.width, scaleY = H / rect.height;
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
}

canvas.addEventListener("mousedown", (e) => {
  if (!running || ball.flying) return;
  const pos = getPos(e);
  if (Math.hypot(pos.x - ball.x, pos.y - ball.y) < 40) { dragging = true; dragStart = pos; }
});
canvas.addEventListener("mousemove", (e) => { if (dragging) dragStart = getPos(e); });
window.addEventListener("mouseup", (e) => {
  if (!dragging) return;
  dragging = false;
  const pos = getPos(e);
  const dx = ball.x - pos.x, dy = ball.y - pos.y;
  ball.vx = dx * 0.18;
  ball.vy = dy * 0.18;
  ball.flying = true;
});

function update() {
  if (!running) return;
  if (ball.flying) {
    ball.vy += GRAVITY;
    ball.x += ball.vx;
    ball.y += ball.vy;

    if (!scoredThisFlight &&
        ball.x > HOOP.x - HOOP.w / 2 && ball.x < HOOP.x + HOOP.w / 2 &&
        ball.y > HOOP.y - 8 && ball.y < HOOP.y + 8 && ball.vy > 0) {
      score++;
      document.getElementById("score").textContent = score;
      scoredThisFlight = true;
    }

    if (ball.y > H + 30 || ball.x > W + 30 || ball.x < -30) resetBall();
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#1a1e33";
  ctx.fillRect(0, 0, W, H);

  // Tabela e cesto
  ctx.strokeStyle = "#eef0fb";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(HOOP.x + HOOP.w / 2 + 4, HOOP.y - 40);
  ctx.lineTo(HOOP.x + HOOP.w / 2 + 4, HOOP.y + 10);
  ctx.stroke();

  ctx.strokeStyle = "#ff5d73";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(HOOP.x - HOOP.w / 2, HOOP.y);
  ctx.lineTo(HOOP.x + HOOP.w / 2, HOOP.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(HOOP.x - HOOP.w / 2, HOOP.y);
  ctx.lineTo(HOOP.x - HOOP.w / 2, HOOP.y + 30);
  ctx.moveTo(HOOP.x + HOOP.w / 2, HOOP.y);
  ctx.lineTo(HOOP.x + HOOP.w / 2, HOOP.y + 30);
  ctx.strokeStyle = "rgba(255,255,255,.3)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Linha de arrasto
  if (dragging) {
    ctx.strokeStyle = "rgba(255,255,255,.5)";
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(ball.x, ball.y);
    ctx.lineTo(dragStart.x, dragStart.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Bola
  ctx.fillStyle = "#ff9a5a";
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#0a0603";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, 14, 0, Math.PI * 2);
  ctx.stroke();

  if (!running) {
    ctx.fillStyle = "rgba(16,19,31,.8)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#eef0fb";
    ctx.font = "bold 20px 'Segoe UI'";
    ctx.textAlign = "center";
    ctx.fillText(`Fim de jogo! ${score} cestos`, W / 2, H / 2 - 10);
    ctx.font = "13px 'Segoe UI'";
    ctx.fillStyle = "rgba(255,255,255,.7)";
    ctx.fillText("Clica em recomeçar para jogar de novo", W / 2, H / 2 + 16);
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

document.getElementById("restart-btn").addEventListener("click", start);
loadBest();
start();
loop();
