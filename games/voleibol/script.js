const W = 420, H = 280;
const canvas = document.getElementById("canvas");
canvas.width = W; canvas.height = H;
const ctx = canvas.getContext("2d");

const GROUND_Y = H - 30;
const NET_X = W / 2;
const NET_H = 90;
const GRAVITY = 0.32;

let ball, player, ai, myScore, aiScore, over, keys;

function serve(toLeft) {
  ball = { x: toLeft ? NET_X - 60 : NET_X + 60, y: 60, vx: toLeft ? -2 : 2, vy: 0 };
}

function reset() {
  player = { x: W * 0.25 };
  ai = { x: W * 0.75 };
  myScore = 0; aiScore = 0;
  over = false;
  keys = {};
  document.getElementById("my-score").textContent = 0;
  document.getElementById("ai-score").textContent = 0;
  serve(true);
}

window.addEventListener("keydown", (e) => {
  if (e.code === "ArrowLeft") { keys.left = true; e.preventDefault(); }
  if (e.code === "ArrowRight") { keys.right = true; e.preventDefault(); }
});
window.addEventListener("keyup", (e) => {
  if (e.code === "ArrowLeft") keys.left = false;
  if (e.code === "ArrowRight") keys.right = false;
});

function update() {
  if (over) return;

  if (keys.left) player.x -= 4;
  if (keys.right) player.x += 4;
  player.x = Math.max(16, Math.min(NET_X - 16, player.x));

  ai.x += (ball.x - ai.x) * 0.06;
  ai.x = Math.max(NET_X + 16, Math.min(W - 16, ai.x));

  ball.vy += GRAVITY;
  ball.x += ball.vx;
  ball.y += ball.vy;

  if (ball.x < 12) { ball.x = 12; ball.vx *= -1; }
  if (ball.x > W - 12) { ball.x = W - 12; ball.vx *= -1; }

  if (Math.abs(ball.x - NET_X) < 6 && ball.y > GROUND_Y - NET_H) {
    ball.vx *= -1;
    ball.x += ball.vx > 0 ? 8 : -8;
  }

  [{ p: player, side: "left" }, { p: ai, side: "right" }].forEach(({ p, side }) => {
    const dist = Math.hypot(ball.x - p.x, ball.y - (GROUND_Y - 10));
    if (dist < 22 && ball.vy > 0) {
      const towardNet = side === "left" ? 1 : -1;
      ball.vy = -7 - Math.random() * 1.5;
      ball.vx = towardNet * (2.5 + Math.random() * 1.5);
    }
  });

  if (ball.y > GROUND_Y) {
    if (ball.x < NET_X) { aiScore++; document.getElementById("ai-score").textContent = aiScore; }
    else { myScore++; document.getElementById("my-score").textContent = myScore; }

    if (myScore >= 5 || aiScore >= 5) {
      over = true;
      setTimeout(() => alert(myScore >= 5 ? "Ganhaste! 🎉" : "O rival ganhou."), 100);
      return;
    }
    serve(ball.x >= NET_X);
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#7bb8e8";
  ctx.fillRect(0, 0, W, GROUND_Y - 100);
  ctx.fillStyle = "#f0d896";
  ctx.fillRect(0, GROUND_Y - 100, W, H - (GROUND_Y - 100));

  ctx.strokeStyle = "#eef0fb";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(NET_X, GROUND_Y);
  ctx.lineTo(NET_X, GROUND_Y - NET_H);
  ctx.stroke();

  ctx.font = "30px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("🙆", player.x, GROUND_Y);
  ctx.fillText("🙆", ai.x, GROUND_Y);
  ctx.font = "22px sans-serif";
  ctx.fillText("🏐", ball.x, ball.y);
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

document.getElementById("restart-btn").addEventListener("click", reset);
reset();
loop();
