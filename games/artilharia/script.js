const W = 480, H = 280;
const canvas = document.getElementById("canvas");
canvas.width = W; canvas.height = H;
const ctx = canvas.getContext("2d");

const SEG = 4;
const COLS_T = Math.ceil(W / SEG);
const GRAVITY = 0.18;
const BLAST_R = 26;

let terrain, myTank, aiTank, myHP, aiHP, angle, power, charging, turn, projectile, gameOver;

function generateTerrain() {
  const h = [];
  for (let i = 0; i < COLS_T; i++) {
    const x = i / COLS_T;
    h.push(180 + Math.sin(x * Math.PI * 2.3) * 25 + Math.sin(x * Math.PI * 5) * 10);
  }
  return h;
}

function terrainAt(x) {
  const i = Math.max(0, Math.min(COLS_T - 1, Math.round(x / SEG)));
  return terrain[i];
}

function craterAt(x, radius) {
  const i0 = Math.max(0, Math.round((x - radius) / SEG));
  const i1 = Math.min(COLS_T - 1, Math.round((x + radius) / SEG));
  for (let i = i0; i <= i1; i++) {
    const dx = i * SEG - x;
    const depth = Math.max(0, radius - Math.abs(dx)) * 0.6;
    terrain[i] = Math.min(H - 10, terrain[i] + depth);
  }
}

function reset() {
  terrain = generateTerrain();
  myTank = { x: 40 };
  aiTank = { x: W - 40 };
  myHP = 100; aiHP = 100;
  angle = 45;
  power = 0;
  charging = false;
  turn = "me";
  projectile = null;
  gameOver = false;
  document.getElementById("my-hp").textContent = myHP;
  document.getElementById("ai-hp").textContent = aiHP;
  document.getElementById("angle-val").textContent = angle;
  document.getElementById("status").textContent = "A tua vez! ▲/▼ para o ângulo, mantém ESPAÇO para carregar potência.";
}

window.addEventListener("keydown", (e) => {
  if (turn !== "me" || projectile || gameOver) return;
  if (e.code === "ArrowUp") { angle = Math.min(85, angle + 2); document.getElementById("angle-val").textContent = angle; e.preventDefault(); }
  if (e.code === "ArrowDown") { angle = Math.max(5, angle - 2); document.getElementById("angle-val").textContent = angle; e.preventDefault(); }
  if (e.code === "Space" && !charging) { charging = true; power = 0; e.preventDefault(); }
});
window.addEventListener("keyup", (e) => {
  if (e.code === "Space" && charging) {
    charging = false;
    fire("me", myTank.x, terrainAt(myTank.x) - 8, angle, power);
    e.preventDefault();
  }
});

function fire(owner, x, y, ang, pow) {
  const rad = (ang * Math.PI) / 180;
  const dir = owner === "me" ? 1 : -1;
  const speed = 4 + pow * 0.09;
  projectile = {
    x, y,
    vx: Math.cos(rad) * speed * dir,
    vy: -Math.sin(rad) * speed,
    owner
  };
  document.getElementById("status").textContent = "A voar...";
}

function updateProjectile() {
  if (!projectile) return;
  projectile.vy += GRAVITY;
  projectile.x += projectile.vx;
  projectile.y += projectile.vy;

  const hitTerrain = projectile.y >= terrainAt(projectile.x);
  const hitMe = Math.hypot(projectile.x - myTank.x, projectile.y - (terrainAt(myTank.x) - 8)) < 14;
  const hitAi = Math.hypot(projectile.x - aiTank.x, projectile.y - (terrainAt(aiTank.x) - 8)) < 14;
  const outOfBounds = projectile.x < 0 || projectile.x > W || projectile.y > H;

  if (hitTerrain || hitMe || hitAi || outOfBounds) {
    if (!outOfBounds) {
      craterAt(projectile.x, BLAST_R);
      if (hitMe) { myHP = Math.max(0, myHP - 34); document.getElementById("my-hp").textContent = myHP; }
      if (hitAi) { aiHP = Math.max(0, aiHP - 34); document.getElementById("ai-hp").textContent = aiHP; }
      else if (!hitMe) {
        const distToAi = Math.abs(projectile.x - aiTank.x);
        const distToMe = Math.abs(projectile.x - myTank.x);
        if (distToAi < BLAST_R) { aiHP = Math.max(0, aiHP - 20); document.getElementById("ai-hp").textContent = aiHP; }
        if (distToMe < BLAST_R) { myHP = Math.max(0, myHP - 20); document.getElementById("my-hp").textContent = myHP; }
      }
    }
    projectile = null;

    if (myHP <= 0 || aiHP <= 0) {
      gameOver = true;
      document.getElementById("status").textContent = myHP <= 0 ? "O rival venceu!" : "🎉 Ganhaste!";
      return;
    }

    if (turn === "me") {
      turn = "ai";
      document.getElementById("status").textContent = "Vez do rival...";
      setTimeout(aiTurn, 900);
    } else {
      turn = "me";
      document.getElementById("status").textContent = "A tua vez! ▲/▼ para o ângulo, mantém ESPAÇO para carregar potência.";
    }
  }
}

function aiTurn() {
  if (gameOver) return;
  const dist = Math.abs(aiTank.x - myTank.x);
  const aiAngle = 35 + Math.random() * 20;
  const aiPower = Math.min(100, Math.max(30, dist / 5 + (Math.random() - 0.5) * 20));
  fire("ai", aiTank.x, terrainAt(aiTank.x) - 8, aiAngle, aiPower);
}

function update() {
  if (charging) power = Math.min(100, power + 1.6);
  updateProjectile();
}

function drawTerrain() {
  ctx.fillStyle = "#5a8f4a";
  ctx.beginPath();
  ctx.moveTo(0, H);
  for (let i = 0; i < COLS_T; i++) ctx.lineTo(i * SEG, terrain[i]);
  ctx.lineTo(W, H);
  ctx.closePath();
  ctx.fill();
}

function drawTank(x, color, hp) {
  const y = terrainAt(x);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x - 14, y - 14, 28, 14, 3);
  ctx.fill();
  ctx.fillRect(x - 3, y - 22, 6, 10);
  ctx.fillStyle = "rgba(0,0,0,.4)";
  ctx.fillRect(x - 15, y - 26, 30, 4);
  ctx.fillStyle = hp > 40 ? "#7ee8b5" : "#ff5d73";
  ctx.fillRect(x - 15, y - 26, 30 * (hp / 100), 4);
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#a8d0e8";
  ctx.fillRect(0, 0, W, H);
  drawTerrain();
  drawTank(myTank.x, "#ff5d73", myHP);
  drawTank(aiTank.x, "#5da9ff", aiHP);

  if (turn === "me" && !projectile && !gameOver) {
    const rad = (angle * Math.PI) / 180;
    const y0 = terrainAt(myTank.x) - 8;
    ctx.strokeStyle = "rgba(255,255,255,.6)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(myTank.x, y0);
    ctx.lineTo(myTank.x + Math.cos(rad) * 30, y0 - Math.sin(rad) * 30);
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,.15)";
    ctx.fillRect(20, H - 20, 100, 10);
    ctx.fillStyle = "#ffd166";
    ctx.fillRect(20, H - 20, power, 10);
  }

  if (projectile) {
    ctx.fillStyle = "#10131f";
    ctx.beginPath();
    ctx.arc(projectile.x, projectile.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function loop() {
  if (!gameOver) update();
  draw();
  requestAnimationFrame(loop);
}

document.getElementById("restart-btn").addEventListener("click", reset);
reset();
loop();
