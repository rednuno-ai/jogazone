const W = 480, H = 420;
const canvas = document.getElementById("canvas");
canvas.width = W; canvas.height = H;
const ctx = canvas.getContext("2d");

const TRUCK_LEN = 54, TRUCK_W = 24;

let level, truck, bay, cones, hits, keys, parked;

const LEVELS = [
  { bay: { x: 380, y: 100, w: 70, h: 46, angle: 0 }, cones: [[220, 180], [220, 250], [300, 320]], start: { x: 60, y: 340, angle: -Math.PI / 2 } },
  { bay: { x: 60, y: 60, w: 60, h: 90, angle: Math.PI / 2 }, cones: [[180, 120], [260, 220], [180, 300], [320, 340]], start: { x: 400, y: 360, angle: Math.PI } },
  { bay: { x: 400, y: 340, w: 70, h: 46, angle: 0 }, cones: [[150, 100], [250, 150], [150, 250], [300, 260], [200, 340]], start: { x: 40, y: 60, angle: 0 } }
];

function loadLevel(idx) {
  level = LEVELS[idx % LEVELS.length];
  truck = { x: level.start.x, y: level.start.y, angle: level.start.angle, speed: 0 };
  bay = level.bay;
  cones = level.cones.map(([x, y]) => ({ x, y, r: 12 }));
  hits = 0;
  parked = false;
  document.getElementById("hits").textContent = 0;
  document.getElementById("status").textContent = "Estaciona dentro da zona verde";
}

let levelIndex = 0;
document.getElementById("level").textContent = 1;

keys = { up: false, down: false, left: false, right: false };
window.addEventListener("keydown", (e) => {
  const m = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" };
  if (m[e.code]) { keys[m[e.code]] = true; e.preventDefault(); }
});
window.addEventListener("keyup", (e) => {
  const m = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" };
  if (m[e.code]) { keys[m[e.code]] = false; e.preventDefault(); }
});

function truckCorners(t) {
  const hl = TRUCK_LEN / 2, hw = TRUCK_W / 2;
  const pts = [[-hl, -hw], [hl, -hw], [hl, hw], [-hl, hw]];
  return pts.map(([lx, ly]) => ({
    x: t.x + lx * Math.cos(t.angle) - ly * Math.sin(t.angle),
    y: t.y + lx * Math.sin(t.angle) + ly * Math.cos(t.angle)
  }));
}

function update() {
  if (parked) return;
  if (keys.up) truck.speed = Math.min(2.6, truck.speed + 0.12);
  else if (keys.down) truck.speed = Math.max(-1.8, truck.speed - 0.12);
  else truck.speed *= 0.9;

  if (Math.abs(truck.speed) > 0.1) {
    const turn = 0.045 * (truck.speed > 0 ? 1 : -1);
    if (keys.left) truck.angle -= turn;
    if (keys.right) truck.angle += turn;
  }

  truck.x += Math.cos(truck.angle) * truck.speed;
  truck.y += Math.sin(truck.angle) * truck.speed;
  truck.x = Math.max(20, Math.min(W - 20, truck.x));
  truck.y = Math.max(20, Math.min(H - 20, truck.y));

  const corners = truckCorners(truck);
  for (const cone of cones) {
    for (const c of corners) {
      if (Math.hypot(c.x - cone.x, c.y - cone.y) < cone.r + 4) {
        truck.speed *= -0.4;
        hits++;
        document.getElementById("hits").textContent = hits;
        break;
      }
    }
  }

  const insideBay = corners.every((c) =>
    c.x > bay.x - bay.w / 2 && c.x < bay.x + bay.w / 2 &&
    c.y > bay.y - bay.h / 2 && c.y < bay.y + bay.h / 2
  );
  if (insideBay && Math.abs(truck.speed) < 0.15) {
    parked = true;
    document.getElementById("status").textContent = "🎉 Estacionado! A carregar próximo nível...";
    setTimeout(() => {
      levelIndex++;
      document.getElementById("level").textContent = levelIndex + 1;
      loadLevel(levelIndex);
    }, 1400);
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#2a2f45";
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.translate(bay.x, bay.y);
  ctx.rotate(bay.angle);
  ctx.strokeStyle = "#7ee8b5";
  ctx.setLineDash([6, 6]);
  ctx.lineWidth = 3;
  ctx.strokeRect(-bay.w / 2, -bay.h / 2, bay.w, bay.h);
  ctx.setLineDash([]);
  ctx.restore();

  cones.forEach((c) => {
    ctx.fillStyle = "#ffd166";
    ctx.beginPath();
    ctx.moveTo(c.x, c.y - c.r);
    ctx.lineTo(c.x - c.r, c.y + c.r);
    ctx.lineTo(c.x + c.r, c.y + c.r);
    ctx.closePath();
    ctx.fill();
  });

  ctx.save();
  ctx.translate(truck.x, truck.y);
  ctx.rotate(truck.angle);
  ctx.fillStyle = parked ? "#7ee8b5" : "#ff5d73";
  ctx.beginPath();
  ctx.roundRect(-TRUCK_LEN / 2, -TRUCK_W / 2, TRUCK_LEN, TRUCK_W, 5);
  ctx.fill();
  ctx.fillStyle = "rgba(16,19,31,.5)";
  ctx.fillRect(TRUCK_LEN / 2 - 16, -TRUCK_W / 2 + 3, 12, TRUCK_W - 6);
  ctx.restore();
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

document.getElementById("restart-btn").addEventListener("click", () => loadLevel(levelIndex));
loadLevel(0);
loop();
