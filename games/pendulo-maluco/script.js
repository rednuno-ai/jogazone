const W = 420, H = 380;
const canvas = document.getElementById("canvas");
canvas.width = W; canvas.height = H;
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const attemptsEl = document.getElementById("attempts");
const bestEl = document.getElementById("best");

const PIVOT = { x: 140, y: 40 };
const ROPE_L = 200;
const AMPL = 1.0;
const OMEGA = 1.8;
const GROUND_Y = 340;
const TARGET_X = 340;
const GRAVITY = 600;
const RINGS = [{ r: 15, pts: 3 }, { r: 35, pts: 2 }, { r: 60, pts: 1 }];

let t, swinging, flying, ball, score, attemptsLeft, best, over;

function reset() {
  t = 0;
  swinging = true;
  flying = false;
  ball = null;
  score = 0;
  attemptsLeft = 5;
  best = parseInt(localStorage.getItem("jogazone-pendulo-best") || "0", 10);
  over = false;
  scoreEl.textContent = 0;
  attemptsEl.textContent = attemptsLeft;
  bestEl.textContent = best;
}

function pendulumState(time) {
  const theta = AMPL * Math.sin(OMEGA * time);
  const thetaDot = AMPL * OMEGA * Math.cos(OMEGA * time);
  const x = PIVOT.x + ROPE_L * Math.sin(theta);
  const y = PIVOT.y + ROPE_L * Math.cos(theta);
  const vx = ROPE_L * Math.cos(theta) * thetaDot;
  const vy = -ROPE_L * Math.sin(theta) * thetaDot;
  return { x, y, vx, vy };
}

function release() {
  if (!swinging || over) return;
  const state = pendulumState(t);
  ball = { x: state.x, y: state.y, vx: state.vx, vy: state.vy };
  swinging = false;
  flying = true;
}

function scoreForLanding(x) {
  const dist = Math.abs(x - TARGET_X);
  for (const ring of RINGS) {
    if (dist <= ring.r) return ring.pts;
  }
  return 0;
}

function landBall() {
  flying = false;
  const pts = scoreForLanding(ball.x);
  score += pts;
  scoreEl.textContent = score;
  attemptsLeft--;
  attemptsEl.textContent = attemptsLeft;

  if (attemptsLeft <= 0) {
    over = true;
    if (score > best) {
      best = score;
      bestEl.textContent = best;
      localStorage.setItem("jogazone-pendulo-best", String(best));
    }
  } else {
    setTimeout(() => {
      t = 0;
      swinging = true;
      ball = null;
    }, 900);
  }
}

canvas.addEventListener("click", release);
window.addEventListener("keydown", (e) => {
  if (e.code === "Space") { e.preventDefault(); release(); }
});

function update(dt) {
  if (over) return;
  if (swinging) {
    t += dt;
  } else if (flying) {
    ball.vy += GRAVITY * dt;
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;
    if (ball.y >= GROUND_Y) {
      ball.y = GROUND_Y;
      landBall();
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#0d1a2f";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#2d5a3a";
  ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);

  RINGS.slice().reverse().forEach((ring, i) => {
    ctx.fillStyle = i % 2 === 0 ? "#ffd166" : "#fff";
    ctx.beginPath();
    ctx.ellipse(TARGET_X, GROUND_Y, ring.r, ring.r * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  const pos = swinging ? pendulumState(t) : ball;
  if (pos) {
    ctx.strokeStyle = "rgba(255,255,255,.5)";
    ctx.lineWidth = 2;
    if (swinging) {
      ctx.beginPath();
      ctx.moveTo(PIVOT.x, PIVOT.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
    ctx.fillStyle = "#ff5d73";
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 12, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#888";
  ctx.beginPath();
  ctx.arc(PIVOT.x, PIVOT.y, 6, 0, Math.PI * 2);
  ctx.fill();

  if (over) {
    ctx.fillStyle = "rgba(20,24,40,.85)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#eef0fb";
    ctx.font = "bold 20px 'Segoe UI'";
    ctx.textAlign = "center";
    ctx.fillText(`Fim de jogo! ${score} pontos`, W / 2, H / 2 - 10);
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
