const holeNumEl = document.getElementById("hole-num");
const strokesEl = document.getElementById("strokes");
const totalEl = document.getElementById("total");
const wrap = document.getElementById("canvas-wrap");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0d1a2f);

const camera = new THREE.PerspectiveCamera(50, 4 / 3, 0.1, 100);
camera.position.set(0, 9, 9);
camera.lookAt(0, 0, -2);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(560, 420);
wrap.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 0.7));
const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
dirLight.position.set(4, 10, 5);
scene.add(dirLight);

const BOUNDS = { minX: -5.5, maxX: 5.5, minZ: -7.5, maxZ: 7.5 };
const BALL_START = { x: 0, z: 6.5 };
const BALL_R = 0.25;
const HOLE_R = 0.4;
const FRICTION = 0.9;
const MAX_DRAG = 130;
const POWER_SCALE = 0.9;

const green = new THREE.Mesh(
  new THREE.PlaneGeometry(BOUNDS.maxX - BOUNDS.minX, BOUNDS.maxZ - BOUNDS.minZ),
  new THREE.MeshStandardMaterial({ color: 0x2d7a3a })
);
green.rotation.x = -Math.PI / 2;
scene.add(green);

const holeMesh = new THREE.Mesh(
  new THREE.CircleGeometry(HOLE_R, 24),
  new THREE.MeshStandardMaterial({ color: 0x0a0a0a })
);
holeMesh.rotation.x = -Math.PI / 2;
holeMesh.position.y = 0.01;
scene.add(holeMesh);

const ballMesh = new THREE.Mesh(
  new THREE.SphereGeometry(BALL_R, 16, 16),
  new THREE.MeshStandardMaterial({ color: 0xffffff })
);
scene.add(ballMesh);

let ball, holePos, holeIndex, strokes, total, sliding, over, drag;

const HOLE_POSITIONS = [
  { x: 0, z: -6 },
  { x: -3.5, z: -5 },
  { x: 3.5, z: -6.5 },
];

function reset() {
  holeIndex = 0;
  total = 0;
  totalEl.textContent = 0;
  startHole();
}

function startHole() {
  ball = { x: BALL_START.x, z: BALL_START.z, vx: 0, vz: 0 };
  holePos = HOLE_POSITIONS[holeIndex];
  holeMesh.position.set(holePos.x, 0.01, holePos.z);
  strokes = 0;
  sliding = false;
  over = false;
  drag = null;
  holeNumEl.textContent = holeIndex + 1;
  strokesEl.textContent = 0;
  syncBall();
}

function syncBall() {
  ballMesh.position.set(ball.x, BALL_R, ball.z);
}

function hitBall(vx, vz) {
  if (sliding || over) return;
  ball.vx = vx;
  ball.vz = vz;
  sliding = true;
  strokes++;
  strokesEl.textContent = strokes;
}

function screenToLocal(e) {
  const rect = renderer.domElement.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * (560 / rect.width),
    y: (e.clientY - rect.top) * (420 / rect.height),
  };
}

renderer.domElement.addEventListener("mousedown", (e) => {
  if (sliding || over) return;
  const p = screenToLocal(e);
  drag = { startX: p.x, startY: p.y, curX: p.x, curY: p.y };
});
window.addEventListener("mousemove", (e) => {
  if (!drag) return;
  const p = screenToLocal(e);
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
  if (dist > 8) {
    hitBall(dx * (POWER_SCALE / 10), dy * (POWER_SCALE / 10));
  }
});

function checkHoled() {
  const dist = Math.hypot(ball.x - holePos.x, ball.z - holePos.z);
  const speed = Math.hypot(ball.vx, ball.vz);
  return dist < HOLE_R - 0.05 && speed < 3.5;
}

function nextHole() {
  total += strokes;
  totalEl.textContent = total;
  holeIndex++;
  if (holeIndex >= HOLE_POSITIONS.length) {
    over = true;
  } else {
    setTimeout(startHole, 900);
  }
}

function update(dt) {
  if (!sliding) return;
  const speed = Math.hypot(ball.vx, ball.vz);
  if (speed < 0.15) {
    sliding = false;
    if (checkHoled()) {
      nextHole();
    }
    return;
  }
  const decel = FRICTION * dt * 10;
  const newSpeed = Math.max(0, speed - decel);
  const scale = speed > 0 ? newSpeed / speed : 0;
  ball.vx *= scale;
  ball.vz *= scale;

  ball.x += ball.vx * dt;
  ball.z += ball.vz * dt;

  if (ball.x - BALL_R < BOUNDS.minX) { ball.x = BOUNDS.minX + BALL_R; ball.vx *= -0.6; }
  if (ball.x + BALL_R > BOUNDS.maxX) { ball.x = BOUNDS.maxX - BALL_R; ball.vx *= -0.6; }
  if (ball.z - BALL_R < BOUNDS.minZ) { ball.z = BOUNDS.minZ + BALL_R; ball.vz *= -0.6; }
  if (ball.z + BALL_R > BOUNDS.maxZ) { ball.z = BOUNDS.maxZ - BALL_R; ball.vz *= -0.6; }

  syncBall();

  if (checkHoled()) {
    sliding = false;
    nextHole();
  }
}

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  update(dt);
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}

reset();
requestAnimationFrame(loop);
