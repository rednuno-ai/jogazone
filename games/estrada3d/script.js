const canvas = document.getElementById("canvas");
const wrap = document.getElementById("scene-wrap");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0e1a);
scene.fog = new THREE.Fog(0x0b0e1a, 20, 90);

const camera = new THREE.PerspectiveCamera(60, wrap.clientWidth / wrap.clientHeight, 0.1, 200);
camera.position.set(0, 4.2, 8);
camera.lookAt(0, 1, -20);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.shadowMap.enabled = true;
renderer.setSize(wrap.clientWidth, wrap.clientHeight);
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));

window.addEventListener("resize", () => {
  camera.aspect = wrap.clientWidth / wrap.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(wrap.clientWidth, wrap.clientHeight);
});

// Luzes
scene.add(new THREE.AmbientLight(0x8899cc, 0.6));
const sun = new THREE.DirectionalLight(0xffffff, 1.1);
sun.position.set(6, 12, 4);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
scene.add(sun);

// Estrada
const ROAD_WIDTH = 9;
const road = new THREE.Mesh(
  new THREE.PlaneGeometry(ROAD_WIDTH, 400),
  new THREE.MeshStandardMaterial({ color: 0x24283e, roughness: 0.9 })
);
road.rotation.x = -Math.PI / 2;
road.position.z = -150;
road.receiveShadow = true;
scene.add(road);

[-1, 1].forEach((side) => {
  const grass = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 400),
    new THREE.MeshStandardMaterial({ color: 0x122a1e, roughness: 1 })
  );
  grass.rotation.x = -Math.PI / 2;
  grass.position.set(side * (ROAD_WIDTH / 2 + 15), -0.01, -150);
  grass.receiveShadow = true;
  scene.add(grass);
});

// Marcações da faixa (recicladas)
const dashes = [];
for (let i = 0; i < 40; i++) {
  [-1, 1].forEach((x) => {
    const dash = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.02, 1.4),
      new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x333333 })
    );
    dash.position.set(x * (ROAD_WIDTH / 6), 0.02, -i * 5);
    scene.add(dash);
    dashes.push(dash);
  });
}

const LANE_X = [-ROAD_WIDTH / 3, 0, ROAD_WIDTH / 3];

function buildTruck(color) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.7, 1.1, 3.2),
    new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.2 })
  );
  body.position.y = 0.75;
  body.castShadow = true;
  group.add(body);

  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.9, 1.1),
    new THREE.MeshStandardMaterial({ color: 0xeef0fb, roughness: 0.3 })
  );
  cabin.position.set(0, 1.35, 1.3);
  cabin.castShadow = true;
  group.add(cabin);

  [[-0.8, -1.1], [0.8, -1.1], [-0.8, 1.1], [0.8, 1.1]].forEach(([x, z]) => {
    const wheel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.35, 0.3, 12),
      new THREE.MeshStandardMaterial({ color: 0x111111 })
    );
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, 0.35, z);
    group.add(wheel);
  });

  return group;
}

const player = buildTruck(0xff5d73);
player.position.set(0, 0, 0);
scene.add(player);

let playerLane = 1;
let obstacles = [];
let speed = 14;
let distance = 0;
let best = Number(localStorage.getItem("jogazone-estrada3d-best") || 0);
let running = true;
let spawnTimer = 0;
document.getElementById("best").textContent = best;

window.addEventListener("keydown", (e) => {
  if (!running) return;
  if (e.code === "ArrowLeft" && playerLane > 0) playerLane--;
  if (e.code === "ArrowRight" && playerLane < 2) playerLane++;
});

const obstacleColors = [0x5da9ff, 0xffd166, 0x7ee8b5, 0xc58bff, 0xff9a5a];

function spawnObstacle() {
  const lane = Math.floor(Math.random() * 3);
  const truck = buildTruck(obstacleColors[Math.floor(Math.random() * obstacleColors.length)]);
  truck.position.set(LANE_X[lane], 0, -100);
  truck.rotation.y = Math.PI;
  scene.add(truck);
  obstacles.push({ mesh: truck, lane });
}

function resetGame() {
  obstacles.forEach((o) => scene.remove(o.mesh));
  obstacles = [];
  playerLane = 1;
  speed = 14;
  distance = 0;
  spawnTimer = 0;
  running = true;
  document.getElementById("score").textContent = 0;
}

canvas.addEventListener("click", () => { if (!running) resetGame(); });

let lastTime = performance.now();
function animate(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;

  if (running) {
    distance += speed * dt;
    speed = Math.min(34, 14 + distance / 25);
    document.getElementById("score").textContent = Math.floor(distance);

    const targetX = LANE_X[playerLane];
    player.position.x += (targetX - player.position.x) * 0.15;

    dashes.forEach((d) => {
      d.position.z += speed * dt;
      if (d.position.z > 8) d.position.z -= 200;
    });

    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      spawnObstacle();
      spawnTimer = Math.max(0.5, 1.4 - distance / 800);
    }

    obstacles.forEach((o) => { o.mesh.position.z += speed * dt; });
    obstacles = obstacles.filter((o) => {
      if (o.mesh.position.z > 10) { scene.remove(o.mesh); return false; }
      return true;
    });

    for (const o of obstacles) {
      if (o.lane === playerLane && Math.abs(o.mesh.position.z - player.position.z) < 2.6) {
        running = false;
        if (Math.floor(distance) > best) {
          best = Math.floor(distance);
          localStorage.setItem("jogazone-estrada3d-best", String(best));
          document.getElementById("best").textContent = best;
        }
      }
    }

    camera.position.x += (player.position.x * 0.6 - (camera.position.x - 0)) * 0.08;
    camera.lookAt(player.position.x * 0.3, 1, -20);
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
