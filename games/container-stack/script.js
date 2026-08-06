const W = 320, H = 480;
const BLOCK_H = 28;
const canvas = document.getElementById("canvas");
canvas.width = W; canvas.height = H;
const ctx = canvas.getContext("2d");

const COLORS = ["#5da9ff", "#7ee8b5", "#ffd166", "#ff9a5a", "#c58bff", "#ff5d73"];

let stack, current, camY, best, running, speed;

function loadBest() {
  best = Number(localStorage.getItem("jogazone-container-best") || 0);
  document.getElementById("best").textContent = best;
}

function newMoving(y, prevX, prevW) {
  const dir = Math.random() < 0.5 ? -1 : 1;
  return { x: dir < 0 ? W - prevW : 0, w: prevW, y, dir, speed };
}

function reset() {
  stack = [{ x: (W - 140) / 2, w: 140, y: H - BLOCK_H, color: COLORS[0] }];
  speed = 2.4;
  current = newMoving(H - BLOCK_H * 2, stack[0].x, stack[0].w);
  camY = 0;
  running = true;
  document.getElementById("height").textContent = 0;
}

function drop() {
  if (!running) { reset(); return; }
  const top = stack[stack.length - 1];
  const overlapStart = Math.max(top.x, current.x);
  const overlapEnd = Math.min(top.x + top.w, current.x + current.w);
  const overlapW = overlapEnd - overlapStart;

  if (overlapW <= 4) {
    running = false;
    if (stack.length - 1 > best) {
      best = stack.length - 1;
      localStorage.setItem("jogazone-container-best", String(best));
      document.getElementById("best").textContent = best;
    }
    return;
  }

  const newBlock = { x: overlapStart, w: overlapW, y: current.y, color: COLORS[stack.length % COLORS.length] };
  stack.push(newBlock);
  document.getElementById("height").textContent = stack.length - 1;
  speed = Math.min(6, speed + 0.15);

  if (stack.length > 8) camY += BLOCK_H;

  current = newMoving(current.y - BLOCK_H, newBlock.x, newBlock.w);
}

canvas.addEventListener("click", drop);
window.addEventListener("keydown", (e) => { if (e.code === "Space") { e.preventDefault(); drop(); } });

function update() {
  if (!running) return;
  current.x += current.dir * current.speed;
  if (current.x <= 0 || current.x + current.w >= W) current.dir *= -1;
}

function draw() {
  ctx.clearRect(0, 0, W, H);

  stack.forEach((b) => {
    ctx.fillStyle = b.color;
    ctx.fillRect(b.x, b.y + camY, b.w, BLOCK_H - 2);
  });

  if (running) {
    ctx.fillStyle = COLORS[stack.length % COLORS.length];
    ctx.fillRect(current.x, current.y + camY, current.w, BLOCK_H - 2);
  } else {
    ctx.fillStyle = "rgba(16,19,31,.75)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#eef0fb";
    ctx.font = "bold 20px 'Segoe UI'";
    ctx.textAlign = "center";
    ctx.fillText(`Torre caiu! Altura: ${stack.length - 1}`, W / 2, H / 2 - 10);
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
