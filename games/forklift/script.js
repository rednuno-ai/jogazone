const W = 380, H = 460;
const canvas = document.getElementById("canvas");
canvas.width = W; canvas.height = H;
const ctx = canvas.getContext("2d");

const FLOOR_Y = H - 50;
const STACK_X = W / 2;
const PALLET_W = 70, PALLET_H = 16;

let forkX, dir, speed, stack, score, best, combo, lives, running, particles;

function loadBest() {
  best = Number(localStorage.getItem("jogazone-forklift-best") || 0);
  document.getElementById("best").textContent = best;
}

function reset() {
  forkX = 40;
  dir = 1;
  speed = 2.4;
  stack = [];
  score = 0;
  combo = 0;
  lives = 3;
  running = true;
  particles = [];
  document.getElementById("score").textContent = 0;
  document.getElementById("combo").textContent = 0;
  document.getElementById("lives").textContent = lives;
}

function stackTopY() {
  return FLOOR_Y - stack.length * PALLET_H;
}

function drop() {
  if (!running) { reset(); return; }
  const dist = Math.abs(forkX - STACK_X);
  let gained = 0;
  let perfect = false;

  if (dist < 10) { gained = 30; perfect = true; combo++; }
  else if (dist < 30) { gained = 15; combo = Math.max(0, combo - 1); }
  else if (dist < 55) { gained = 5; combo = 0; }
  else { combo = 0; }

  if (gained > 0) {
    gained += combo * 5;
    score += gained;
    document.getElementById("score").textContent = score;
    document.getElementById("combo").textContent = combo;
    stack.push({ x: perfect ? STACK_X : forkX, offset: forkX - STACK_X });
    if (perfect) {
      for (let i = 0; i < 12; i++) {
        particles.push({
          x: STACK_X, y: stackTopY(),
          vx: (Math.random() - 0.5) * 4, vy: -Math.random() * 3 - 1,
          life: 1
        });
      }
    }
    speed = Math.min(6, speed + 0.15);
  } else {
    lives--;
    document.getElementById("lives").textContent = lives;
    combo = 0;
    document.getElementById("combo").textContent = 0;
    if (lives <= 0) {
      running = false;
      if (score > best) {
        best = score;
        localStorage.setItem("jogazone-forklift-best", String(best));
        document.getElementById("best").textContent = best;
      }
    }
  }
}

canvas.addEventListener("click", drop);
window.addEventListener("keydown", (e) => { if (e.code === "Space") { e.preventDefault(); drop(); } });

function update() {
  if (!running) return;
  forkX += dir * speed;
  if (forkX < 30) { forkX = 30; dir = 1; }
  if (forkX > W - 30) { forkX = W - 30; dir = -1; }

  particles.forEach((p) => { p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.life -= 0.03; });
  particles = particles.filter((p) => p.life > 0);
}

function drawForklift(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#ffd166";
  ctx.beginPath();
  ctx.roundRect(-16, -22, 32, 22, 4);
  ctx.fill();
  ctx.fillStyle = "#2a2f45";
  ctx.fillRect(-12, -8, 10, 10);
  ctx.strokeStyle = "#8a8f9a";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-14, -22); ctx.lineTo(-14, 4);
  ctx.moveTo(14, -22); ctx.lineTo(14, 4);
  ctx.stroke();
  ctx.restore();
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#23273d";
  ctx.fillRect(0, 0, W, H);

  // Prateleiras decorativas
  ctx.fillStyle = "rgba(255,255,255,.04)";
  for (let i = 0; i < 4; i++) ctx.fillRect(10 + i * 95, 20, 70, H - 100);

  ctx.strokeStyle = "rgba(255,255,255,.25)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, FLOOR_Y + 4);
  ctx.lineTo(W, FLOOR_Y + 4);
  ctx.stroke();

  ctx.strokeStyle = "rgba(126,232,181,.5)";
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(STACK_X, 10);
  ctx.lineTo(STACK_X, FLOOR_Y);
  ctx.stroke();
  ctx.setLineDash([]);

  stack.forEach((p, i) => {
    const y = FLOOR_Y - (i + 1) * PALLET_H;
    ctx.fillStyle = i % 2 === 0 ? "#c78a4a" : "#d8a25c";
    ctx.fillRect(p.x - PALLET_W / 2, y, PALLET_W, PALLET_H - 2);
  });

  particles.forEach((pt) => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, pt.life);
    ctx.fillStyle = "#ffd166";
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  if (running) {
    drawForklift(forkX, FLOOR_Y - stack.length * PALLET_H - 4);
    ctx.fillStyle = "#8a5a2a";
    ctx.fillRect(forkX - PALLET_W / 2, FLOOR_Y - stack.length * PALLET_H - 4, PALLET_W, PALLET_H - 2);
  } else {
    ctx.fillStyle = "rgba(16,19,31,.8)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#eef0fb";
    ctx.font = "bold 20px 'Segoe UI'";
    ctx.textAlign = "center";
    ctx.fillText(`Fim de jogo! ${score} pontos`, W / 2, H / 2 - 10);
    ctx.font = "13px 'Segoe UI'";
    ctx.fillStyle = "rgba(255,255,255,.7)";
    ctx.fillText("Clica para recomeçar", W / 2, H / 2 + 16);
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loadBest();
reset();
loop();
