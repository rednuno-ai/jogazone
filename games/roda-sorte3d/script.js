const canvas = document.getElementById("canvas");
const wrap = document.getElementById("scene-wrap");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x141830);
scene.fog = new THREE.Fog(0x141830, 14, 30);

const camera = new THREE.PerspectiveCamera(45, wrap.clientWidth / wrap.clientHeight, 0.1, 100);
camera.position.set(0, 8, 8.5);
camera.lookAt(0, 0, 0);

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
const sun = new THREE.DirectionalLight(0xffffff, 1.2);
sun.position.set(6, 10, 4);
sun.castShadow = true;
scene.add(sun);

const TILES = [
  { label: "+50", value: 50, color: 0x7ee8b5 },
  { label: "-30", value: -30, color: 0xff5d73 },
  { label: "+20", value: 20, color: 0x5da9ff },
  { label: "CURINGA", value: "double", color: 0xffd166 },
  { label: "+80", value: 80, color: 0x7ee8b5 },
  { label: "-50", value: -50, color: 0xff5d73 },
  { label: "+40", value: 40, color: 0x5da9ff },
  { label: "+10", value: 10, color: 0xc58bff },
  { label: "+60", value: 60, color: 0x7ee8b5 },
  { label: "-20", value: -20, color: 0xff5d73 },
  { label: "+30", value: 30, color: 0x5da9ff },
  { label: "+90", value: 90, color: 0xc58bff }
];
const RADIUS = 5;

const boardGroup = new THREE.Group();
scene.add(boardGroup);

TILES.forEach((tile, i) => {
  const angle = (i / TILES.length) * Math.PI * 2;
  const tileMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 1.2, 0.3, 6),
    new THREE.MeshStandardMaterial({ color: tile.color, roughness: 0.5 })
  );
  tileMesh.position.set(Math.cos(angle) * RADIUS, 0, Math.sin(angle) * RADIUS);
  tileMesh.rotation.y = angle;
  tileMesh.castShadow = true;
  tileMesh.receiveShadow = true;
  tileMesh.frustumCulled = false;
  boardGroup.add(tileMesh);
});

const centerHub = new THREE.Mesh(
  new THREE.CylinderGeometry(1.4, 1.4, 0.2, 24),
  new THREE.MeshStandardMaterial({ color: 0x1c2138, roughness: 0.6 })
);
centerHub.frustumCulled = false;
boardGroup.add(centerHub);

const token = new THREE.Mesh(
  new THREE.ConeGeometry(0.35, 0.7, 16),
  new THREE.MeshStandardMaterial({ color: 0xeef0fb, emissive: 0xff5d73, emissiveIntensity: 0.3 })
);
token.castShadow = true;
token.frustumCulled = false;
scene.add(token);

const wheelGroup = new THREE.Group();
wheelGroup.position.set(0, 2.6, 3.2);
scene.add(wheelGroup);
const wheelDisc = new THREE.Mesh(
  new THREE.CylinderGeometry(1.1, 1.1, 0.18, 6),
  new THREE.MeshStandardMaterial({ color: 0x5da9ff, roughness: 0.4 })
);
wheelDisc.rotation.x = Math.PI / 2;
wheelDisc.castShadow = true;
wheelDisc.frustumCulled = false;
wheelGroup.add(wheelDisc);
const pointer = new THREE.Mesh(
  new THREE.ConeGeometry(0.18, 0.4, 8),
  new THREE.MeshStandardMaterial({ color: 0xffd166 })
);
pointer.position.set(0, 0, 1.25);
pointer.rotation.x = Math.PI / 2;
pointer.frustumCulled = false;
wheelGroup.add(pointer);

let posIndex, score, best, round, spinning, wheelSpin, wheelTargetSpin;

function loadBest() {
  best = Number(localStorage.getItem("jogazone-rodasorte3d-best") || 0);
  document.getElementById("best").textContent = best;
}

function updateTokenPosition(idx) {
  const angle = (idx / TILES.length) * Math.PI * 2;
  token.position.set(Math.cos(angle) * RADIUS, 0.55, Math.sin(angle) * RADIUS);
}

function reset() {
  posIndex = 0;
  score = 0;
  round = 1;
  spinning = false;
  wheelSpin = 0;
  document.getElementById("round").textContent = round;
  document.getElementById("score").textContent = score;
  document.getElementById("status").textContent = "Gira a roda para começares!";
  document.getElementById("spin-btn").disabled = false;
  updateTokenPosition(0);
}

function applyTile() {
  const tile = TILES[posIndex];
  if (tile.value === "double") {
    score *= 2;
    document.getElementById("status").textContent = `🃏 Curinga! Pontuação duplicada para ${score}.`;
  } else {
    score += tile.value;
    document.getElementById("status").textContent = tile.value >= 0 ? `+${tile.value} pontos!` : `${tile.value} pontos...`;
  }
  document.getElementById("score").textContent = score;
}

document.getElementById("spin-btn").addEventListener("click", () => {
  if (spinning || round > 10) return;
  spinning = true;
  document.getElementById("spin-btn").disabled = true;
  document.getElementById("status").textContent = "A girar...";

  const steps = 2 + Math.floor(Math.random() * 6);
  wheelTargetSpin = wheelSpin + Math.PI * 6 + steps * (Math.PI * 2 / 6);

  const startIdx = posIndex;
  const targetIdx = (startIdx + steps) % TILES.length;
  let moveStep = 0;

  const moveInterval = setInterval(() => {
    moveStep++;
    posIndex = (startIdx + moveStep) % TILES.length;
    updateTokenPosition(posIndex);
    if (moveStep >= steps) {
      clearInterval(moveInterval);
      applyTile();
      round++;
      document.getElementById("round").textContent = Math.min(round, 10);
      spinning = false;
      if (round > 10) {
        if (score > best) {
          best = score;
          localStorage.setItem("jogazone-rodasorte3d-best", String(best));
          document.getElementById("best").textContent = best;
        }
        document.getElementById("status").textContent = `Fim de jogo! Pontuação final: ${score}`;
        document.getElementById("spin-btn").textContent = "Jogar novamente";
        document.getElementById("spin-btn").disabled = false;
        document.getElementById("spin-btn").onclick = () => { reset(); document.getElementById("spin-btn").textContent = "Girar a roda"; document.getElementById("spin-btn").onclick = null; attachSpin(); };
      } else {
        document.getElementById("spin-btn").disabled = false;
      }
    }
  }, 160);
});

function attachSpin() {
  document.getElementById("spin-btn").addEventListener("click", () => {}, { once: true });
}

function animate() {
  wheelSpin += (wheelTargetSpin - wheelSpin) * 0.06 || 0;
  wheelGroup.rotation.z = wheelSpin;
  boardGroup.rotation.y += 0.0015;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

loadBest();
reset();
wheelTargetSpin = 0;
animate();
