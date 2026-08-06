const W = 340, H = 480;
const canvas = document.getElementById("canvas");
canvas.width = W; canvas.height = H;
const ctx = canvas.getContext("2d");
const GOAL_W = 110;
const PADDLE_R = 22, PUCK_R = 12;

let myPaddle, aiPaddle, puck, myScore, aiScore, over;

function resetPuck(dirY) {
  puck = { x: W / 2, y: H / 2, vx: (Math.random() - 0.5) * 4, vy: dirY * 4 };
}

function reset() {
  myPaddle = { x: W / 2, y: H - 50 };
  aiPaddle = { x: W / 2, y: 50 };
  myScore = 0; aiScore = 0;
  over = false;
  document.getElementById("my-score").textContent = 0;
  document.getElementById("ai-score").textContent = 0;
  resetPuck(1);
}

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = W / rect.width, scaleY = H / rect.height;
  myPaddle.x = Math.max(PADDLE_R, Math.min(W - PADDLE_R, (e.clientX - rect.left) * scaleX));
  myPaddle.y = Math.max(H / 2 + PADDLE_R, Math.min(H - PADDLE_R, (e.clientY - rect.top) * scaleY));
});
canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const scaleX = W / rect.width, scaleY = H / rect.height;
  const t = e.touches[0];
  myPaddle.x = Math.max(PADDLE_R, Math.min(W - PADDLE_R, (t.clientX - rect.left) * scaleX));
  myPaddle.y = Math.max(H / 2 + PADDLE_R, Math.min(H - PADDLE_R, (t.clientY - rect.top) * scaleY));
}, { passive: false });

function update() {
  if (over) return;

  aiPaddle.x += (puck.x - aiPaddle.x) * 0.08;
  aiPaddle.y += ((puck.y < H / 2 ? Math.max(50, puck.y) : 50) - aiPaddle.y) * 0.08;
  aiPaddle.x = Math.max(PADDLE_R, Math.min(W - PADDLE_R, aiPaddle.x));
  aiPaddle.y = Math.max(PADDLE_R, Math.min(H / 2 - PADDLE_R, aiPaddle.y));

  puck.x += puck.vx;
  puck.y += puck.vy;
  puck.vx *= 0.995;
  puck.vy *= 0.995;

  if (puck.x < PUCK_R || puck.x > W - PUCK_R) { puck.vx *= -1; puck.x = Math.max(PUCK_R, Math.min(W - PUCK_R, puck.x)); }

  [myPaddle, aiPaddle].forEach((p) => {
    const dx = puck.x - p.x, dy = puck.y - p.y;
    const dist = Math.hypot(dx, dy);
    if (dist < PADDLE_R + PUCK_R) {
      const angle = Math.atan2(dy, dx);
      const speed = Math.max(6, Math.hypot(puck.vx, puck.vy) * 1.15);
      puck.vx = Math.cos(angle) * speed;
      puck.vy = Math.sin(angle) * speed;
      const overlap = PADDLE_R + PUCK_R - dist;
      puck.x += Math.cos(angle) * overlap;
      puck.y += Math.sin(angle) * overlap;
    }
  });

  if (puck.y < PUCK_R) {
    if (puck.x > W / 2 - GOAL_W / 2 && puck.x < W / 2 + GOAL_W / 2) {
      myScore++;
      document.getElementById("my-score").textContent = myScore;
      if (myScore >= 7) return endGame("Ganhaste! 🎉");
      resetPuck(1);
    } else { puck.vy *= -1; puck.y = PUCK_R; }
  }
  if (puck.y > H - PUCK_R) {
    if (puck.x > W / 2 - GOAL_W / 2 && puck.x < W / 2 + GOAL_W / 2) {
      aiScore++;
      document.getElementById("ai-score").textContent = aiScore;
      if (aiScore >= 7) return endGame("O rival ganhou.");
      resetPuck(-1);
    } else { puck.vy *= -1; puck.y = H - PUCK_R; }
  }
}

function endGame(msg) {
  over = true;
  setTimeout(() => alert(msg), 100);
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#0f2a3a";
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = "rgba(255,255,255,.3)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, H / 2);
  ctx.lineTo(W, H / 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(W / 2, H / 2, 40, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = "#ffd166";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(W / 2 - GOAL_W / 2, 2);
  ctx.lineTo(W / 2 + GOAL_W / 2, 2);
  ctx.moveTo(W / 2 - GOAL_W / 2, H - 2);
  ctx.lineTo(W / 2 + GOAL_W / 2, H - 2);
  ctx.stroke();

  ctx.fillStyle = "#5da9ff";
  ctx.beginPath();
  ctx.arc(aiPaddle.x, aiPaddle.y, PADDLE_R, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ff5d73";
  ctx.beginPath();
  ctx.arc(myPaddle.x, myPaddle.y, PADDLE_R, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#10131f";
  ctx.beginPath();
  ctx.arc(puck.x, puck.y, PUCK_R, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#eef0fb";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

document.getElementById("restart-btn").addEventListener("click", reset);
reset();
loop();
