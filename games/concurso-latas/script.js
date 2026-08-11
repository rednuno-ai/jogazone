const W = 480, H = 360;
const canvas = document.getElementById("canvas");
canvas.width = W; canvas.height = H;
const ctx = canvas.getContext("2d");

const roundEl = document.getElementById("round");
const ballsEl = document.getElementById("balls");
const cansLeftEl = document.getElementById("cans-left");

const TABLE_Y = 300;
const CAN_W = 30, CAN_H = 34;
const BALL_START = { x: 60, y: 270 };
const BALL_R = 10;
const GRAVITY = 480;
const MAX_DRAG = 120;
const POWER_SCALE = 3.4;

let cans, ball, flying, ballsLeft, round, over, drag;

function buildPyramid(baseX) {
  const list = [];
  const rows = [3, 2, 1];
  let y = TABLE_Y - CAN_H;
  rows.forEach((count) => {
    const totalW = count * CAN_W;
    const startX = baseX - totalW / 2;
    for (let i = 0; i < count; i++) {
      list.push({ x: startX + i * CAN_W, y, alive: true });
    }
    y -= CAN_H;
  });
  return list;
}

function reset() {
  round = 1;
  startRound();
}

function startRound() {
  cans = buildPyramid(360);
  ball = { x: BALL_START.x, y: BALL_START.y, vx: 0, vy: 0 };
  flying = false;
  ballsLeft = 5;
  over = false;
  drag = null;
  roundEl.textContent = round;
  ballsEl.textContent = ballsLeft;
  cansLeftEl.textContent = cans.length;
}

function throwBall(vx, vy) {
  if (flying || over || ballsLeft <= 0) return;
  ball = { x: BALL_START.x, y: BALL_START.y, vx, vy };
  flying = true;
  ballsLeft--;
  ballsEl.textContent = ballsLeft;
}

function screenPos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * (W / rect.width),
    y: (e.clientY - rect.top) * (H / rect.height),
  };
}

canvas.addEventListener("mousedown", (e) => {
  if (flying || over || ballsLeft <= 0) return;
  const p = screenPos(e);
  drag = { startX: p.x, startY: p.y, curX: p.x, curY: p.y };
});
window.addEventListener("mousemove", (e) => {
  if (!drag) return;
  const p = screenPos(e);
  drag.curX = p.x;
  drag.curY = p.y;
});
window.addEventListener("mouseup", () => {
  if (!drag) return;
  let dx = drag.startX - drag.curX;
  let dy = drag.startY - drag.curY;
  const dist = Math.min(MAX_DRAG, Math.hypot(dx, dy));
  const angle = Math.atan2(dy, dx);
  dx = Math.cos(angle) * dist;
  dy = Math.sin(angle) * dist;
  drag = null;
  if (dist > 8) throwBall(dx * (POWER_SCALE / 10), dy * (POWER_SCALE / 10));
});

function checkRoundState() {
  cansLeftEl.textContent = cans.filter((c) => c.alive).length;
  if (cans.every((c) => !c.alive)) {
    round++;
    setTimeout(startRound, 900);
  } else if (ballsLeft <= 0 && !flying) {
    over = true;
  }
}

function update(dt) {
  if (over) return;
  if (!flying) return;

  ball.vy += GRAVITY * dt;
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  for (const can of cans) {
    if (!can.alive) continue;
    if (ball.x + BALL_R > can.x && ball.x - BALL_R < can.x + CAN_W &&
        ball.y + BALL_R > can.y && ball.y - BALL_R < can.y + CAN_H) {
      can.alive = false;
    }
  }

  if (ball.x > W + 30 || ball.y > H + 30 || ball.x < -30) {
    flying = false;
    checkRoundState();
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#2a2035";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#4a3a2a";
  ctx.fillRect(0, TABLE_Y, W, H - TABLE_Y);

  ctx.fillStyle = "#c0c8d0";
  cans.forEach((c) => {
    if (c.alive) ctx.fillRect(c.x, c.y, CAN_W, CAN_H);
  });

  ctx.fillStyle = "#ff5d73";
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
  ctx.fill();

  if (drag) {
    ctx.strokeStyle = "rgba(255,255,255,.4)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(drag.startX, drag.startY);
    ctx.lineTo(drag.curX, drag.curY);
    ctx.stroke();
  }

  if (over) {
    ctx.fillStyle = "rgba(20,24,40,.85)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#eef0fb";
    ctx.font = "bold 20px 'Segoe UI'";
    ctx.textAlign = "center";
    ctx.fillText(`Fim de jogo! Chegaste à ronda ${round}`, W / 2, H / 2 - 10);
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
