const canvas = document.getElementById("canvas");
const wrap = document.getElementById("scene-wrap");
const R = 3.4; // raio do túnel
const GAP = Math.PI * 0.6; // largura da abertura em cada anel

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x05010a, 0.028);

const camera = new THREE.PerspectiveCamera(75, wrap.clientWidth / wrap.clientHeight, 0.1, 200);
camera.position.set(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(wrap.clientWidth, wrap.clientHeight);
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
renderer.setClearColor(0x05010a);

window.addEventListener("resize", () => {
  camera.aspect = wrap.clientWidth / wrap.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(wrap.clientWidth, wrap.clientHeight);
});

scene.add(new THREE.AmbientLight(0x8888ff, 0.5));
const glow = new THREE.PointLight(0x9d6bff, 3, 20);
scene.add(glow);

// Tubo do túnel (linhas neon)
const tunnelGroup = new THREE.Group();
scene.add(tunnelGroup);
const TUNNEL_LEN = 200;
for (let i = 0; i < 26; i++) {
  const ringGeo = new THREE.TorusGeometry(R, 0.03, 8, 24);
  const mat = new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0x5da9ff : 0xc58bff });
  const guide = new THREE.Mesh(ringGeo, mat);
  guide.position.z = -i * 8;
  guide.frustumCulled = false;
  tunnelGroup.add(guide);
}
// Linhas longitudinais para dar sensação de velocidade
for (let i = 0; i < 10; i++) {
  const angle = (i / 10) * Math.PI * 2;
  const geo = new THREE.CylinderGeometry(0.02, 0.02, TUNNEL_LEN, 4);
  const mat = new THREE.MeshBasicMaterial({ color: 0x2a2f6a });
  const line = new THREE.Mesh(geo, mat);
  line.rotation.x = Math.PI / 2;
  line.position.set(Math.cos(angle) * R, Math.sin(angle) * R, -TUNNEL_LEN / 2 + 10);
  line.frustumCulled = false;
  scene.add(line);
}

const shipGeo = new THREE.SphereGeometry(0.28, 16, 16);
const shipMat = new THREE.MeshStandardMaterial({ color: 0xff5d73, emissive: 0xff2244, emissiveIntensity: 0.8 });
const ship = new THREE.Mesh(shipGeo, shipMat);
ship.frustumCulled = false;
scene.add(ship);

const RING_COLORS = [0x5da9ff, 0x7ee8b5, 0xffd166, 0xc58bff, 0xff5d73];

let rings, playerX, playerY, speed, score, best, running, spawnZ, keys;

function loadBest() {
  best = Number(localStorage.getItem("jogazone-tunelneon-best") || 0);
  document.getElementById("best").textContent = best;
}

function spawnRing() {
  const gapAngle = Math.random() * Math.PI * 2;
  const geo = new THREE.TorusGeometry(R, 0.22, 10, 32, Math.PI * 2 - GAP);
  const mat = new THREE.MeshStandardMaterial({
    color: RING_COLORS[rings.length % RING_COLORS.length],
    emissive: RING_COLORS[rings.length % RING_COLORS.length],
    emissiveIntensity: 0.7
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.z = gapAngle;
  mesh.position.z = spawnZ;
  mesh.frustumCulled = false;
  scene.add(mesh);
  rings.push({ mesh, z: spawnZ, gapStart: gapAngle + (Math.PI * 2 - GAP), passed: false });
  spawnZ -= 14;
}

function reset() {
  rings && rings.forEach((r) => scene.remove(r.mesh));
  rings = [];
  playerX = 0; playerY = 0;
  speed = 9;
  score = 0;
  running = true;
  spawnZ = -20;
  for (let i = 0; i < 6; i++) spawnRing();
  document.getElementById("score").textContent = 0;
}

keys = {};
window.addEventListener("keydown", (e) => {
  const m = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down" };
  if (m[e.code]) { keys[m[e.code]] = true; e.preventDefault(); }
});
window.addEventListener("keyup", (e) => {
  const m = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down" };
  if (m[e.code]) { keys[m[e.code]] = false; e.preventDefault(); }
});

function normalizeAngle(a) {
  a = a % (Math.PI * 2);
  if (a < 0) a += Math.PI * 2;
  return a;
}

function update(dt) {
  if (!running) return;
  const moveSpeed = 4.4;
  if (keys.left) playerX -= moveSpeed * dt;
  if (keys.right) playerX += moveSpeed * dt;
  if (keys.up) playerY += moveSpeed * dt;
  if (keys.down) playerY -= moveSpeed * dt;

  const dist = Math.hypot(playerX, playerY);
  const maxDist = R - 0.5;
  if (dist > maxDist) {
    playerX = (playerX / dist) * maxDist;
    playerY = (playerY / dist) * maxDist;
  }

  ship.position.set(playerX, playerY, -1.2);
  camera.position.set(playerX * 0.5, playerY * 0.5, 0);
  camera.lookAt(playerX, playerY, -10);
  glow.position.set(playerX, playerY, -1);

  speed = Math.min(24, 9 + score * 0.5);

  rings.forEach((r) => { r.z += speed * dt; r.mesh.position.z = r.z; });

  for (const r of rings) {
    if (!r.passed && r.z > -1.2 && r.z < 1.5) {
      const playerAngle = normalizeAngle(Math.atan2(playerY, playerX));
      const gapStart = normalizeAngle(r.gapStart);
      const gapEnd = normalizeAngle(r.gapStart + GAP);
      let inGap;
      if (gapStart < gapEnd) inGap = playerAngle > gapStart && playerAngle < gapEnd;
      else inGap = playerAngle > gapStart || playerAngle < gapEnd;

      if (dist < maxDist - 0.15 && dist < 0.6) {
        inGap = true; // perto do centro passa sempre
      }

      if (!inGap) {
        running = false;
      } else {
        r.passed = true;
        score++;
        document.getElementById("score").textContent = score;
        if (score > best) {
          best = score;
          localStorage.setItem("jogazone-tunelneon-best", String(best));
          document.getElementById("best").textContent = best;
        }
      }
    }
  }

  rings = rings.filter((r) => {
    if (r.z > 3) { scene.remove(r.mesh); return false; }
    return true;
  });
  while (rings.length < 6) spawnRing();

  tunnelGroup.children.forEach((g) => {
    g.position.z += speed * dt;
    if (g.position.z > 8) g.position.z -= 26 * 8;
  });

  if (!running) {
    if (score > best) {
      best = score;
      localStorage.setItem("jogazone-tunelneon-best", String(best));
      document.getElementById("best").textContent = best;
    }
  }
}

canvas.addEventListener("click", () => { if (!running) reset(); });

let last = performance.now();
function animate(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  update(dt);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

loadBest();
reset();
requestAnimationFrame(animate);
