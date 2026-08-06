const canvas = document.getElementById("canvas");
const wrap = document.getElementById("scene-wrap");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x7bb8e8);
scene.fog = new THREE.Fog(0x7bb8e8, 18, 40);

const camera = new THREE.PerspectiveCamera(55, wrap.clientWidth / wrap.clientHeight, 0.1, 100);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.shadowMap.enabled = true;
renderer.setSize(wrap.clientWidth, wrap.clientHeight);
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));

window.addEventListener("resize", () => {
  camera.aspect = wrap.clientWidth / wrap.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(wrap.clientWidth, wrap.clientHeight);
});

scene.add(new THREE.AmbientLight(0xffffff, 0.9));
const sun = new THREE.DirectionalLight(0xfff2d0, 1.1);
sun.position.set(8, 14, 6);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
scene.add(sun);

const GROUND_SIZE = 34;
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(GROUND_SIZE, GROUND_SIZE),
  new THREE.MeshStandardMaterial({ color: 0x4a8f4a, roughness: 1 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
ground.frustumCulled = false;
scene.add(ground);

const obstacles = [];

function addHouse(x, z, color) {
  const group = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 1.8, 2.4),
    new THREE.MeshStandardMaterial({ color, roughness: 0.8 })
  );
  base.position.y = 0.9;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(1.9, 1.3, 4),
    new THREE.MeshStandardMaterial({ color: 0x8b4a3a, roughness: 0.7 })
  );
  roof.position.y = 2.4;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  group.add(roof);
  group.position.set(x, 0, z);
  group.children.forEach((c) => (c.frustumCulled = false));
  scene.add(group);
  obstacles.push({ x, z, r: 1.7 });
}

function addTree(x, z) {
  const group = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.22, 1.2, 8),
    new THREE.MeshStandardMaterial({ color: 0x6b4a2a })
  );
  trunk.position.y = 0.6;
  const leaves = new THREE.Mesh(
    new THREE.ConeGeometry(0.9, 1.6, 8),
    new THREE.MeshStandardMaterial({ color: 0x2f7a3f })
  );
  leaves.position.y = 1.7;
  group.add(trunk, leaves);
  group.position.set(x, 0, z);
  group.children.forEach((c) => { c.castShadow = true; c.frustumCulled = false; });
  scene.add(group);
  obstacles.push({ x, z, r: 0.9 });
}

addHouse(-8, -6, 0xd8a24a);
addHouse(-8, 4, 0xc76a5a);
addHouse(8, -6, 0x6a9ac7);
addHouse(8, 4, 0xa9c76a);
addHouse(0, -10, 0xc7a96a);
[[-4, 8], [4, 8], [-11, -1], [11, -1], [-3, -3], [5, -8]].forEach(([x, z]) => addTree(x, z));

// Fonte central
const well = new THREE.Mesh(
  new THREE.CylinderGeometry(1.1, 1.1, 0.8, 16),
  new THREE.MeshStandardMaterial({ color: 0x9a9a9a, roughness: 0.6 })
);
well.position.set(0, 0.4, 0);
well.castShadow = true;
well.frustumCulled = false;
scene.add(well);
obstacles.push({ x: 0, z: 0, r: 1.4 });

function buildCharacter(cloakColor, capColor, scale = 1) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.ConeGeometry(0.45, 1.1, 12),
    new THREE.MeshStandardMaterial({ color: cloakColor, roughness: 0.6 })
  );
  body.position.y = 0.75;
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xe8b382, roughness: 0.7 })
  );
  head.position.y = 1.5;
  const cap = new THREE.Mesh(
    new THREE.ConeGeometry(0.34, 0.32, 12),
    new THREE.MeshStandardMaterial({ color: capColor })
  );
  cap.position.y = 1.78;
  group.add(body, head, cap);
  group.scale.setScalar(scale);
  group.children.forEach((c) => { c.castShadow = true; c.frustumCulled = false; });
  return group;
}

const player = buildCharacter(0x2f9a8f, 0x6b4a2a);
scene.add(player);

const guards = [
  { mesh: buildCharacter(0x5a5a7a, 0x2a2a3a, 1.15), from: { x: -6, z: 2 }, to: { x: 6, z: 2 }, t: 0, speed: 0.35 },
  { mesh: buildCharacter(0x5a5a7a, 0x2a2a3a, 1.15), from: { x: 0, z: -8 }, to: { x: 0, z: 8 }, t: 0.5, speed: 0.28 }
];
guards.forEach((g) => scene.add(g.mesh));

let coins, coinsTotal, playerPos, keys, timeLeft, running, timerId, invuln;

function loadCoins() {
  const positions = [
    [-5, -3], [5, -3], [-5, 2], [5, 2], [3, 6], [-3, 6],
    [9, -9], [-9, -9], [-2, -8], [2, -8], [0, 6], [7, 1]
  ];
  coinsTotal = positions.length;
  document.getElementById("total-coins").textContent = coinsTotal;
  return positions.map(([x, z]) => {
    const mesh = new THREE.Mesh(
      new THREE.TorusGeometry(0.3, 0.12, 8, 16),
      new THREE.MeshStandardMaterial({ color: 0xffd166, emissive: 0xffa500, emissiveIntensity: 0.4 })
    );
    mesh.rotation.x = Math.PI / 2;
    mesh.position.set(x, 0.4, z);
    mesh.frustumCulled = false;
    scene.add(mesh);
    return { x, z, mesh, taken: false };
  });
}

function resetGame() {
  coins && coins.forEach((c) => scene.remove(c.mesh));
  coins = loadCoins();
  playerPos = { x: 0, z: 12 };
  keys = {};
  timeLeft = 60;
  running = true;
  invuln = 0;
  document.getElementById("coins").textContent = 0;
  document.getElementById("timer").textContent = 60;
  document.getElementById("status").textContent = "Recolhe todas as moedas e foge dos guardas!";

  clearInterval(timerId);
  timerId = setInterval(() => {
    if (!running) return;
    timeLeft--;
    document.getElementById("timer").textContent = timeLeft;
    if (timeLeft <= 0) {
      running = false;
      document.getElementById("status").textContent = "⏰ Tempo esgotado! Tenta outra vez.";
    }
  }, 1000);
}

window.addEventListener("keydown", (e) => {
  const m = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" };
  if (m[e.code]) { keys[m[e.code]] = true; e.preventDefault(); }
});
window.addEventListener("keyup", (e) => {
  const m = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" };
  if (m[e.code]) { keys[m[e.code]] = false; e.preventDefault(); }
});

function collides(x, z, margin) {
  for (const o of obstacles) {
    if (Math.hypot(x - o.x, z - o.z) < o.r + margin) return true;
  }
  return Math.abs(x) > GROUND_SIZE / 2 - 1 || Math.abs(z) > GROUND_SIZE / 2 - 1;
}

function update(dt) {
  if (!running) return;
  const speed = 5.2 * dt;
  let dx = 0, dz = 0;
  if (keys.up) dz -= 1;
  if (keys.down) dz += 1;
  if (keys.left) dx -= 1;
  if (keys.right) dx += 1;
  if (dx && dz) { dx *= 0.7071; dz *= 0.7071; }

  const nx = playerPos.x + dx * speed;
  const nz = playerPos.z + dz * speed;
  if (!collides(nx, playerPos.z, 0.4)) playerPos.x = nx;
  if (!collides(playerPos.x, nz, 0.4)) playerPos.z = nz;

  player.position.set(playerPos.x, 0, playerPos.z);
  if (dx || dz) player.rotation.y = Math.atan2(dx, dz);

  coins.forEach((c) => {
    if (!c.taken && Math.hypot(playerPos.x - c.x, playerPos.z - c.z) < 0.9) {
      c.taken = true;
      scene.remove(c.mesh);
      const found = coins.filter((cc) => cc.taken).length;
      document.getElementById("coins").textContent = found;
      if (found === coinsTotal) {
        running = false;
        document.getElementById("status").textContent = "🎉 Recolheste todas as moedas!";
      }
    }
  });

  if (invuln > 0) invuln -= dt;
  guards.forEach((g) => {
    g.t += g.speed * dt;
    const s = (Math.sin(g.t) + 1) / 2;
    const gx = g.from.x + (g.to.x - g.from.x) * s;
    const gz = g.from.z + (g.to.z - g.from.z) * s;
    g.mesh.position.set(gx, 0, gz);
    if (invuln <= 0 && Math.hypot(playerPos.x - gx, playerPos.z - gz) < 1.1) {
      invuln = 1.5;
      playerPos = { x: 0, z: 12 };
      document.getElementById("status").textContent = "😵 Apanharam-te! Voltaste ao início.";
    }
  });

  const camDist = 9, camHeight = 6;
  camera.position.x += (playerPos.x - camera.position.x) * 0.08;
  camera.position.z += (playerPos.z + camDist - camera.position.z) * 0.08;
  camera.position.y += (camHeight - camera.position.y) * 0.08;
  camera.lookAt(playerPos.x, 0.5, playerPos.z);
}

let last = performance.now();
function animate(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  update(dt);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

document.getElementById("restart-btn").addEventListener("click", resetGame);
camera.position.set(0, 6, 21);
resetGame();
requestAnimationFrame(animate);
