const W = 340, H = 340;
const canvas = document.getElementById("canvas");
canvas.width = W; canvas.height = H;
const ctx = canvas.getContext("2d");
const CX = W / 2, CY = H / 2, MAX_R = 150;

const RINGS = [
  { r: 15, score: 50, color: "#ff5d73" },
  { r: 45, score: 25, color: "#ffd166" },
  { r: 80, score: 15, color: "#7ee8b5" },
  { r: 115, score: 10, color: "#5da9ff" },
  { r: 150, score: 5, color: "#c58bff" }
];

let t, dartsLeft, score, best, hits, throwing;

function loadBest() {
  best = Number(localStorage.getItem("jogazone-dardos-best") || 0);
  document.getElementById("best").textContent = best;
}

function reset() {
  t = 0;
  dartsLeft = 6;
  score = 0;
  hits = [];
  throwing = false;
  document.getElementById("dart-num").textContent = 1;
  document.getElementById("score").textContent = 0;
}

function aimPos() {
  const x = CX + Math.sin(t * 1.3) * 110;
  const y = CY + Math.sin(t * 0.9) * 90;
  return { x, y };
}

function scoreAt(x, y) {
  const dist = Math.hypot(x - CX, y - CY);
  for (const ring of RINGS) if (dist <= ring.r) return ring.score;
  return 0;
}

canvas.addEventListener("click", () => {
  if (dartsLeft <= 0) { reset(); return; }
  if (throwing) return;
  throwing = true;
  const pos = aimPos();
  const gained = scoreAt(pos.x, pos.y);
  score += gained;
  hits.push(pos);
  document.getElementById("score").textContent = score;
  dartsLeft--;
  document.getElementById("dart-num").textContent = Math.min(6, 7 - dartsLeft);

  setTimeout(() => {
    throwing = false;
    if (dartsLeft <= 0) {
      if (score > best) {
        best = score;
        localStorage.setItem("jogazone-dardos-best", String(best));
        document.getElementById("best").textContent = best;
      }
      setTimeout(() => alert(`Fim de jogo! Pontuação: ${score}. Clica para jogar de novo.`), 100);
    }
  }, 300);
});

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#1c2138";
  ctx.fillRect(0, 0, W, H);

  for (let i = RINGS.length - 1; i >= 0; i--) {
    ctx.fillStyle = RINGS[i].color;
    ctx.beginPath();
    ctx.arc(CX, CY, RINGS[i].r, 0, Math.PI * 2);
    ctx.fill();
  }

  hits.forEach((p) => {
    ctx.fillStyle = "#10131f";
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  if (dartsLeft > 0) {
    const pos = aimPos();
    ctx.strokeStyle = "#eef0fb";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pos.x - 10, pos.y);
    ctx.lineTo(pos.x + 10, pos.y);
    ctx.moveTo(pos.x, pos.y - 10);
    ctx.lineTo(pos.x, pos.y + 10);
    ctx.stroke();
  }
}

function loop() {
  t += 0.045;
  draw();
  requestAnimationFrame(loop);
}

loadBest();
reset();
loop();
