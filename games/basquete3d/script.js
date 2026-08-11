const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const powerFill = document.getElementById("power-fill");
const wrap = document.getElementById("canvas-wrap");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0d1a2f);

const camera = new THREE.PerspectiveCamera(55, 4 / 3, 0.1, 100);
camera.position.set(0, 2.2, 5);
camera.lookAt(0, 2.6, -8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(560, 420);
wrap.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(3, 8, 3);
scene.add(dirLight);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 30),
  new THREE.MeshStandardMaterial({ color: 0x8a5a3a })
);
floor.rotation.x = -Math.PI / 2;
floor.position.z = -8;
scene.add(floor);

const HOOP = { x: 0, y: 3.0, z: -9, radius: 0.5 };

const pole = new THREE.Mesh(
  new THREE.CylinderGeometry(0.08, 0.08, 3.2, 8),
  new THREE.MeshStandardMaterial({ color: 0x444444 })
);
pole.position.set(HOOP.x, 1.6, HOOP.z - 0.5);
scene.add(pole);

const backboard = new THREE.Mesh(
  new THREE.BoxGeometry(1.8, 1.1, 0.05),
  new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 })
);
backboard.position.set(HOOP.x, 3.4, HOOP.z - 0.4);
scene.add(backboard);

const rim = new THREE.Mesh(
  new THREE.TorusGeometry(HOOP.radius, 0.04, 8, 24),
  new THREE.MeshStandardMaterial({ color: 0xff5d73 })
);
rim.rotation.x = Math.PI / 2;
rim.position.set(HOOP.x, HOOP.y, HOOP.z);
scene.add(rim);

const ballMesh = new THREE.Mesh(
  new THREE.SphereGeometry(0.22, 16, 16),
  new THREE.MeshStandardMaterial({ color: 0xff9a5a })
);
scene.add(ballMesh);

const SHOOT_POS = { x: 0, y: 1.3, z: 0 };
const GRAVITY = 9.8;

let ball, inFlight, aim, charging, power, chargeDir, score, timeLeft, over, scored;

function reset() {
  ball = { x: SHOOT_POS.x, y: SHOOT_POS.y, z: SHOOT_POS.z, vx: 0, vy: 0, vz: 0 };
  inFlight = false;
  aim = 0;
  charging = false;
  power = 0;
  chargeDir = 1;
  score = 0;
  timeLeft = 45;
  over = false;
  scored = false;
  scoreEl.textContent = 0;
  timeEl.textContent = timeLeft;
  syncBallMesh();
}

function syncBallMesh() {
  ballMesh.position.set(ball.x, ball.y, ball.z);
}

function shoot() {
  const p = power;
  ball.vx = aim * 3;
  ball.vy = 6 + p * 4;
  ball.vz = -(7 + p * 5);
  inFlight = true;
  scored = false;
}

function startCharge() {
  if (inFlight || over) return;
  charging = true;
  power = 0;
  chargeDir = 1;
}

function releaseCharge() {
  if (!charging) return;
  charging = false;
  shoot();
}

window.addEventListener("keydown", (e) => {
  if (e.code === "Space") { e.preventDefault(); startCharge(); }
});
window.addEventListener("keyup", (e) => {
  if (e.code === "Space") releaseCharge();
});
renderer.domElement.addEventListener("mousedown", startCharge);
window.addEventListener("mouseup", releaseCharge);

let keysHeld = {};
window.addEventListener("keydown", (e) => { keysHeld[e.code] = true; });
window.addEventListener("keyup", (e) => { keysHeld[e.code] = false; });

function checkScore() {
  const dx = ball.x - HOOP.x;
  const dy = ball.y - HOOP.y;
  if (!scored && Math.abs(ball.z - HOOP.z) < 0.3 && ball.vy < 0 &&
      Math.sqrt(dx * dx + dy * dy) < HOOP.radius - 0.15) {
    scored = true;
    score++;
    scoreEl.textContent = score;
  }
}

function update(dt) {
  if (over) return;

  timeLeft -= dt;
  if (timeLeft <= 0) {
    timeLeft = 0;
    over = true;
  }
  timeEl.textContent = Math.ceil(timeLeft);

  if (charging) {
    power += chargeDir * dt * 1.2;
    if (power >= 1) { power = 1; chargeDir = -1; }
    if (power <= 0) { power = 0; chargeDir = 1; }
    powerFill.style.width = (power * 100) + "%";
  }

  if (keysHeld["ArrowLeft"]) aim = Math.max(-1, aim - dt * 1.5);
  if (keysHeld["ArrowRight"]) aim = Math.min(1, aim + dt * 1.5);

  if (inFlight) {
    ball.vy -= GRAVITY * dt;
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;
    ball.z += ball.vz * dt;
    checkScore();
    syncBallMesh();

    if (ball.y < 0 || ball.z < HOOP.z - 4) {
      inFlight = false;
      ball = { x: SHOOT_POS.x, y: SHOOT_POS.y, z: SHOOT_POS.z, vx: 0, vy: 0, vz: 0 };
      syncBallMesh();
    }
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
