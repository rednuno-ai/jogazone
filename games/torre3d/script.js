const canvas = document.getElementById("canvas");
const wrap = document.getElementById("scene-wrap");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x141830);
scene.fog = new THREE.Fog(0x141830, 20, 55);

const camera = new THREE.PerspectiveCamera(45, wrap.clientWidth / wrap.clientHeight, 0.1, 100);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.shadowMap.enabled = true;
renderer.setSize(wrap.clientWidth, wrap.clientHeight);
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));

window.addEventListener("resize", () => {
  camera.aspect = wrap.clientWidth / wrap.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(wrap.clientWidth, wrap.clientHeight);
});

scene.add(new THREE.AmbientLight(0xaabbff, 0.8));
const sun = new THREE.DirectionalLight(0xffffff, 1.3);
sun.position.set(8, 14, 8);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.left = -10;
sun.shadow.camera.right = 10;
sun.shadow.camera.top = 10;
sun.shadow.camera.bottom = -10;
scene.add(sun);

const groundMat = new THREE.MeshStandardMaterial({ color: 0x1c2138, roughness: 1 });
const ground = new THREE.Mesh(new THREE.CylinderGeometry(9, 9, 0.4, 40), groundMat);
ground.position.y = -0.2;
ground.receiveShadow = true;
ground.frustumCulled = false;
scene.add(ground);

const COLORS = [0x5da9ff, 0x7ee8b5, 0xffd166, 0xff9a5a, 0xc58bff, 0xff5d73];
const BLOCK_H = 1;
const START_SIZE = 3;

let stack, current, best, running, orbit, camTargetY;

function loadBest() {
  best = Number(localStorage.getItem("jogazone-torre3d-best") || 0);
  document.getElementById("best").textContent = best;
}

function makeBlockMesh(sx, sz, y, color) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(sx, BLOCK_H, sz),
    new THREE.MeshStandardMaterial({ color, roughness: 0.5 })
  );
  mesh.position.y = y;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.frustumCulled = false;
  scene.add(mesh);
  return mesh;
}

function newMoving(prevBlock, level) {
  const axis = level % 2 === 0 ? "x" : "z";
  const dir = Math.random() < 0.5 ? -1 : 1;
  const range = 3.2;
  const mesh = makeBlockMesh(prevBlock.sx, prevBlock.sz, prevBlock.y + BLOCK_H, COLORS[level % COLORS.length]);
  return {
    mesh, axis, dir, range,
    x: prevBlock.x, z: prevBlock.z,
    sx: prevBlock.sx, sz: prevBlock.sz,
    y: prevBlock.y + BLOCK_H,
    t: axis === "x" ? -range : 0
  };
}

function reset() {
  stack && stack.forEach((b) => scene.remove(b.mesh));
  const base = { x: 0, z: 0, sx: START_SIZE, sz: START_SIZE, y: 0 };
  base.mesh = makeBlockMesh(base.sx, base.sz, base.y, COLORS[0]);
  stack = [base];
  running = true;
  orbit = 0;
  camTargetY = 6;
  document.getElementById("height").textContent = 0;
  current = newMoving(base, 1);
}

function drop() {
  if (!running) { reset(); return; }
  const top = stack[stack.length - 1];
  const c = current;

  const topMin = c.axis === "x" ? top.x - top.sx / 2 : top.z - top.sz / 2;
  const topMax = c.axis === "x" ? top.x + top.sx / 2 : top.z + top.sz / 2;
  const curCenter = c.axis === "x" ? c.x : c.z;
  const curSize = c.axis === "x" ? c.sx : c.sz;
  const curMin = curCenter - curSize / 2, curMax = curCenter + curSize / 2;

  const overlapMin = Math.max(topMin, curMin);
  const overlapMax = Math.min(topMax, curMax);
  const overlap = overlapMax - overlapMin;

  if (overlap <= 0.12) {
    running = false;
    if (stack.length - 1 > best) {
      best = stack.length - 1;
      localStorage.setItem("jogazone-torre3d-best", String(best));
      document.getElementById("best").textContent = best;
    }
    return;
  }

  const newCenter = overlapMin + overlap / 2;
  scene.remove(c.mesh);
  const placed = {
    x: c.axis === "x" ? newCenter : c.x,
    z: c.axis === "x" ? c.z : newCenter,
    sx: c.axis === "x" ? overlap : c.sx,
    sz: c.axis === "x" ? c.sz : overlap,
    y: c.y
  };
  placed.mesh = makeBlockMesh(placed.sx, placed.sz, placed.y, COLORS[stack.length % COLORS.length]);
  placed.mesh.position.x = placed.x;
  placed.mesh.position.z = placed.z;
  stack.push(placed);
  document.getElementById("height").textContent = stack.length - 1;
  camTargetY = placed.y + 6;

  current = newMoving(placed, stack.length);
}

canvas.addEventListener("click", drop);
window.addEventListener("keydown", (e) => { if (e.code === "Space") { e.preventDefault(); drop(); } });

function update(dt) {
  if (running && current) {
    current.t += current.dir * 3.2 * dt;
    if (current.t > current.range) { current.t = current.range; current.dir = -1; }
    if (current.t < -current.range) { current.t = -current.range; current.dir = 1; }

    if (current.axis === "x") { current.x = stack[stack.length - 1].x + current.t; current.mesh.position.x = current.x; current.mesh.position.z = current.z; }
    else { current.z = stack[stack.length - 1].z + current.t; current.mesh.position.z = current.z; current.mesh.position.x = current.x; }
  }

  orbit += dt * 0.12;
  const radius = 13;
  camera.position.x = Math.sin(orbit) * radius;
  camera.position.z = Math.cos(orbit) * radius;
  camera.position.y += (camTargetY - camera.position.y) * 0.04;
  camera.lookAt(0, Math.max(1, camTargetY - 5), 0);
  sun.target.position.set(0, camTargetY - 5, 0);
}

let last = performance.now();
function animate(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  update(dt);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

loadBest();
camera.position.set(0, 6, 13);
reset();
requestAnimationFrame(animate);
