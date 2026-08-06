const W = 300, H = 500;
const canvas = document.getElementById("canvas");
canvas.width = W; canvas.height = H;
const ctx = canvas.getContext("2d");

const BALL_START = { x: W / 2, y: H - 40 };
const PIN_R = 9, BALL_R = 11;
const PIN_TOP_Y = 70;

function pinLayout() {
  const pins = [];
  const rows = [1, 2, 3, 4];
  let id = 0;
  rows.forEach((count, rowIdx) => {
    const y = PIN_TOP_Y + rowIdx * 26;
    const spacing = 24;
    const startX = W / 2 - ((count - 1) * spacing) / 2;
    for (let i = 0; i < count; i++) {
      pins.push({ id: id++, x: startX + i * spacing, y, standing: true });
    }
  });
  return pins;
}

let pins, ball, angle, rolling, frame, rollInFrame, total, best, knockedThisRoll, gameOver, frameStartStanding;

function loadBest() {
  best = Number(localStorage.getItem("jogazone-boliche-best") || 0);
  document.getElementById("best").textContent = best;
}

function newFrame() {
  pins = pinLayout();
  rollInFrame = 1;
  frameStartStanding = 10;
  document.getElementById("roll").textContent = 1;
}

function resetGame() {
  frame = 1;
  total = 0;
  gameOver = false;
  angle = 0;
  rolling = false;
  ball = { ...BALL_START, vx: 0, vy: 0 };
  document.getElementById("frame").textContent = 1;
  document.getElementById("total").textContent = 0;
  document.getElementById("status").textContent = "Usa ◀ / ▶ para mirares e clica para lançares.";
  newFrame();
}

window.addEventListener("keydown", (e) => {
  if (rolling || gameOver) return;
  if (e.code === "ArrowLeft") { angle = Math.max(-0.4, angle - 0.05); e.preventDefault(); }
  if (e.code === "ArrowRight") { angle = Math.min(0.4, angle + 0.05); e.preventDefault(); }
  if (e.code === "Space") { e.preventDefault(); roll(); }
});
canvas.addEventListener("click", () => { if (!rolling && !gameOver) roll(); });

function roll() {
  rolling = true;
  knockedThisRoll = 0;
  ball = { x: BALL_START.x, y: BALL_START.y, vx: Math.sin(angle) * 6, vy: -7 };
  document.getElementById("status").textContent = "A rolar...";
}

function standingCount() { return pins.filter((p) => p.standing).length; }

function endRoll() {
  const nowStanding = standingCount();
  const knocked = frameStartStanding - nowStanding;
  total += knocked;
  document.getElementById("total").textContent = total;

  if (nowStanding === 0 || rollInFrame === 2) {
    frame++;
    if (frame > 10) {
      gameOver = true;
      if (total > best) {
        best = total;
        localStorage.setItem("jogazone-boliche-best", String(best));
        document.getElementById("best").textContent = best;
      }
      document.getElementById("status").textContent = `Jogo terminado! Pontuação final: ${total}`;
      rolling = false;
      return;
    }
    document.getElementById("frame").textContent = frame;
    newFrame();
    document.getElementById("status").textContent = knocked === 10 ? "🎳 Strike!" : "Novo frame — usa ◀ / ▶ e clica para lançares.";
  } else {
    rollInFrame = 2;
    frameStartStanding = nowStanding;
    document.getElementById("roll").textContent = 2;
    document.getElementById("status").textContent = `Derrubaste ${knocked}. Segunda jogada.`;
  }
  rolling = false;
  angle = 0;
  ball = { ...BALL_START, vx: 0, vy: 0 };
}

function update() {
  if (!rolling) return;
  ball.x += ball.vx;
  ball.y += ball.vy;

  if (ball.x < BALL_R || ball.x > W - BALL_R) ball.vx *= -0.6;
  ball.x = Math.max(BALL_R, Math.min(W - BALL_R, ball.x));

  pins.forEach((p) => {
    if (p.standing && Math.hypot(ball.x - p.x, ball.y - p.y) < BALL_R + PIN_R) {
      p.standing = false;
    }
  });

  if (ball.y < PIN_TOP_Y - 40 || standingCount() === 0) {
    endRoll();
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#3a2c1a";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#5a4526";
  ctx.fillRect(20, 20, W - 40, H - 40);

  pins.forEach((p) => {
    if (!p.standing) return;
    ctx.fillStyle = "#eef0fb";
    ctx.beginPath();
    ctx.arc(p.x, p.y, PIN_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ff5d73";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });

  if (!rolling && !gameOver) {
    ctx.strokeStyle = "rgba(255,255,255,.4)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(BALL_START.x, BALL_START.y);
    ctx.lineTo(BALL_START.x + Math.sin(angle) * 200, BALL_START.y - 200);
    ctx.stroke();
  }

  ctx.fillStyle = "#ffd166";
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
resetGame();
loop();
