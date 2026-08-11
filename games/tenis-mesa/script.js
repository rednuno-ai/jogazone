const W = 480, H = 320;
const canvas = document.getElementById("canvas");
canvas.width = W; canvas.height = H;
const ctx = canvas.getContext("2d");

const playerScoreEl = document.getElementById("player-score");
const cpuScoreEl = document.getElementById("cpu-score");

const PADDLE_W = 12, PADDLE_H = 64;
const BALL_R = 7;
const CPU_SPEED = 220;

let player, cpu, ball, playerScore, cpuScore, over, rally;

function reset() {
  player = { x: W - 30, y: H / 2 - PADDLE_H / 2 };
  cpu = { x: 18, y: H / 2 - PADDLE_H / 2 };
  playerScore = 0;
  cpuScore = 0;
  over = false;
  playerScoreEl.textContent = 0;
  cpuScoreEl.textContent = 0;
  serve(Math.random() < 0.5 ? 1 : -1);
}

function serve(dir) {
  ball = { x: W / 2, y: H / 2, vx: 180 * dir, vy: (Math.random() - 0.5) * 120 };
  rally = 0;
}

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const scale = H / rect.height;
  const y = (e.clientY - rect.top) * scale;
  player.y = Math.max(0, Math.min(H - PADDLE_H, y - PADDLE_H / 2));
});

function update(dt) {
  if (over) return;

  const cpuCenter = cpu.y + PADDLE_H / 2;
  if (cpuCenter < ball.y - 10) cpu.y += CPU_SPEED * dt;
  else if (cpuCenter > ball.y + 10) cpu.y -= CPU_SPEED * dt;
  cpu.y = Math.max(0, Math.min(H - PADDLE_H, cpu.y));

  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  if (ball.y - BALL_R < 0) { ball.y = BALL_R; ball.vy *= -1; }
  if (ball.y + BALL_R > H) { ball.y = H - BALL_R; ball.vy *= -1; }

  if (ball.vx < 0 && ball.x - BALL_R < cpu.x + PADDLE_W && ball.x - BALL_R > cpu.x &&
      ball.y > cpu.y && ball.y < cpu.y + PADDLE_H) {
    ball.vx *= -1.05;
    const offset = (ball.y - (cpu.y + PADDLE_H / 2)) / (PADDLE_H / 2);
    ball.vy += offset * 100;
    ball.x = cpu.x + PADDLE_W + BALL_R;
    rally++;
  }

  if (ball.vx > 0 && ball.x + BALL_R > player.x && ball.x + BALL_R < player.x + PADDLE_W &&
      ball.y > player.y && ball.y < player.y + PADDLE_H) {
    ball.vx *= -1.05;
    const offset = (ball.y - (player.y + PADDLE_H / 2)) / (PADDLE_H / 2);
    ball.vy += offset * 100;
    ball.x = player.x - BALL_R;
    rally++;
  }

  if (ball.x < -20) {
    playerScore++;
    playerScoreEl.textContent = playerScore;
    checkWin();
    if (!over) serve(1);
  } else if (ball.x > W + 20) {
    cpuScore++;
    cpuScoreEl.textContent = cpuScore;
    checkWin();
    if (!over) serve(-1);
  }
}

function checkWin() {
  if ((playerScore >= 11 || cpuScore >= 11) && Math.abs(playerScore - cpuScore) >= 2) {
    over = true;
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#0d3d5c";
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = "rgba(255,255,255,.3)";
  ctx.setLineDash([6, 8]);
  ctx.beginPath();
  ctx.moveTo(W / 2, 0);
  ctx.lineTo(W / 2, H);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "#5da9ff";
  ctx.fillRect(player.x, player.y, PADDLE_W, PADDLE_H);
  ctx.fillStyle = "#ff5d73";
  ctx.fillRect(cpu.x, cpu.y, PADDLE_W, PADDLE_H);

  ctx.fillStyle = "#ffd166";
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
  ctx.fill();

  if (over) {
    ctx.fillStyle = "rgba(20,24,40,.85)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#eef0fb";
    ctx.font = "bold 22px 'Segoe UI'";
    ctx.textAlign = "center";
    const msg = playerScore > cpuScore ? "Venceste! 🎉" : "O computador venceu";
    ctx.fillText(msg, W / 2, H / 2 - 10);
    ctx.font = "14px 'Segoe UI'";
    ctx.fillText(`${playerScore} - ${cpuScore}`, W / 2, H / 2 + 18);
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
