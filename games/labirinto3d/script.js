const canvas = document.getElementById("canvas");
const wrap = document.getElementById("scene-wrap");
const SIZE = 9;
const CELL = 4;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0e1a);
scene.fog = new THREE.Fog(0x0b0e1a, 6, 26);

const camera = new THREE.PerspectiveCamera(70, wrap.clientWidth / wrap.clientHeight, 0.1, 100);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.shadowMap.enabled = true;
renderer.setSize(wrap.clientWidth, wrap.clientHeight);
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));

window.addEventListener("resize", () => {
  camera.aspect = wrap.clientWidth / wrap.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(wrap.clientWidth, wrap.clientHeight);
});

scene.add(new THREE.AmbientLight(0x8fa0e0, 1.4));
scene.add(new THREE.HemisphereLight(0x8fb3ff, 0x1a1030, 0.9));
const lamp = new THREE.PointLight(0xffe6b3, 3.2, 18, 1.6);
scene.add(lamp);

let wallMeshes = [], floor, exitLight, exitCell, playerPos, playerAngle, steps, won;

function generateMaze() {
  const grid = Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => ({ n: true, s: true, e: true, w: true, visited: false })));
  const stack = [[0, 0]];
  grid[0][0].visited = true;
  while (stack.length) {
    const [x, y] = stack[stack.length - 1];
    const dirs = [];
    if (y > 0 && !grid[y - 1][x].visited) dirs.push("n");
    if (y < SIZE - 1 && !grid[y + 1][x].visited) dirs.push("s");
    if (x < SIZE - 1 && !grid[y][x + 1].visited) dirs.push("e");
    if (x > 0 && !grid[y][x - 1].visited) dirs.push("w");
    if (dirs.length === 0) { stack.pop(); continue; }
    const dir = dirs[Math.floor(Math.random() * dirs.length)];
    grid[y][x][dir] = false;
    let nx = x, ny = y;
    if (dir === "n") { ny--; grid[ny][nx].s = false; }
    if (dir === "s") { ny++; grid[ny][nx].n = false; }
    if (dir === "e") { nx++; grid[ny][nx].w = false; }
    if (dir === "w") { nx--; grid[ny][nx].e = false; }
    grid[ny][nx].visited = true;
    stack.push([nx, ny]);
  }
  return grid;
}

function buildScene() {
  wallMeshes.forEach((w) => scene.remove(w));
  wallMeshes = [];
  if (floor) scene.remove(floor);
  if (exitLight) scene.remove(exitLight);

  const grid = generateMaze();
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x2a2f6a, roughness: 0.7 });
  const wallGeoNS = new THREE.BoxGeometry(CELL, 3, 0.2);
  const wallGeoEW = new THREE.BoxGeometry(0.2, 3, CELL);

  const origin = -(SIZE * CELL) / 2 + CELL / 2;

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const cx = origin + x * CELL, cz = origin + y * CELL;
      const cell = grid[y][x];
      if (cell.n) addWall(wallGeoNS, wallMat, cx, cz - CELL / 2);
      if (y === SIZE - 1 && cell.s) addWall(wallGeoNS, wallMat, cx, cz + CELL / 2);
      if (cell.w) addWall(wallGeoEW, wallMat, cx - CELL / 2, cz);
      if (x === SIZE - 1 && cell.e) addWall(wallGeoEW, wallMat, cx + CELL / 2, cz);
    }
  }

  floor = new THREE.Mesh(
    new THREE.PlaneGeometry(SIZE * CELL, SIZE * CELL),
    new THREE.MeshStandardMaterial({ color: 0x141830, roughness: 1 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  floor.frustumCulled = false;
  scene.add(floor);

  exitCell = { x: SIZE - 1, y: SIZE - 1 };
  const ex = origin + exitCell.x * CELL, ez = origin + exitCell.y * CELL;
  const exitMarker = new THREE.Mesh(
    new THREE.CylinderGeometry(0.6, 0.6, 0.1, 20),
    new THREE.MeshStandardMaterial({ color: 0xffd166, emissive: 0xffa500, emissiveIntensity: 0.6 })
  );
  exitMarker.position.set(ex, 0.06, ez);
  exitMarker.frustumCulled = false;
  scene.add(exitMarker);
  wallMeshes.push(exitMarker);

  exitLight = new THREE.PointLight(0xffd166, 1.2, 6);
  exitLight.position.set(ex, 1, ez);
  scene.add(exitLight);

  playerPos = { x: origin, z: origin };
  // aponta o jogador para o primeiro corredor aberto a partir da célula inicial
  if (!grid[0][0].e) playerAngle = -Math.PI / 2;
  else if (!grid[0][0].s) playerAngle = Math.PI;
  else playerAngle = 0;
  steps = 0;
  won = false;
  document.getElementById("steps").textContent = 0;
  document.getElementById("status").textContent = "Encontra a saída dourada";

  function addWall(geo, mat, x, z) {
    const wall = new THREE.Mesh(geo, mat);
    wall.position.set(x, 1.5, z);
    wall.castShadow = true;
    wall.receiveShadow = true;
    wall.frustumCulled = false;
    scene.add(wall);
    wallMeshes.push(wall);
  }
}

const keys = {};
window.addEventListener("keydown", (e) => {
  const map = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right", KeyW: "up", KeyS: "down", KeyA: "left", KeyD: "right" };
  if (map[e.code]) { keys[map[e.code]] = true; e.preventDefault(); }
});
window.addEventListener("keyup", (e) => {
  const map = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right", KeyW: "up", KeyS: "down", KeyA: "left", KeyD: "right" };
  if (map[e.code]) { keys[map[e.code]] = false; e.preventDefault(); }
});

function collides(x, z) {
  const margin = 0.35;
  const box = new THREE.Box3(
    new THREE.Vector3(x - margin, 0.5, z - margin),
    new THREE.Vector3(x + margin, 2.5, z + margin)
  );
  for (const w of wallMeshes) {
    if (!w.geometry.parameters.width) continue;
    const wb = new THREE.Box3().setFromObject(w);
    if (wb.intersectsBox(box)) return true;
  }
  return false;
}

function update(dt) {
  if (won) return;
  const turnSpeed = 2.0, moveSpeed = 3.2;
  if (keys.left) playerAngle += turnSpeed * dt;
  if (keys.right) playerAngle -= turnSpeed * dt;

  let dx = 0, dz = 0;
  if (keys.up) { dx -= Math.sin(playerAngle) * moveSpeed * dt; dz -= Math.cos(playerAngle) * moveSpeed * dt; }
  if (keys.down) { dx += Math.sin(playerAngle) * moveSpeed * dt; dz += Math.cos(playerAngle) * moveSpeed * dt; }

  if (dx || dz) {
    const nx = playerPos.x + dx, nz = playerPos.z + dz;
    if (!collides(nx, playerPos.z)) playerPos.x = nx;
    if (!collides(playerPos.x, nz)) playerPos.z = nz;
    steps++;
    document.getElementById("steps").textContent = steps;
  }

  camera.position.set(playerPos.x, 1.4, playerPos.z);
  camera.rotation.y = playerAngle;
  lamp.position.set(playerPos.x, 2, playerPos.z);

  const origin = -(SIZE * CELL) / 2 + CELL / 2;
  const ex = origin + exitCell.x * CELL, ez = origin + exitCell.y * CELL;
  if (Math.hypot(playerPos.x - ex, playerPos.z - ez) < 1) {
    won = true;
    document.getElementById("status").textContent = "🏆 Encontraste a saída!";
    setTimeout(buildScene, 1800);
  }
}

let last = performance.now();
function animate(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  update(dt);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

document.getElementById("restart-btn").addEventListener("click", buildScene);
buildScene();
requestAnimationFrame(animate);
