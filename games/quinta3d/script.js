const canvas = document.getElementById("canvas");
const wrap = document.getElementById("scene-wrap");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8fd0f0);
scene.fog = new THREE.Fog(0x8fd0f0, 16, 32);

const camera = new THREE.PerspectiveCamera(48, wrap.clientWidth / wrap.clientHeight, 0.1, 100);
camera.position.set(0, 8, 8);
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

scene.add(new THREE.AmbientLight(0xffffff, 0.9));
const sun = new THREE.DirectionalLight(0xfff2d0, 1.1);
sun.position.set(6, 12, 5);
sun.castShadow = true;
scene.add(sun);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 16),
  new THREE.MeshStandardMaterial({ color: 0x5fae52, roughness: 1 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
ground.frustumCulled = false;
scene.add(ground);

// Celeiro decorativo
const barn = new THREE.Group();
const barnBody = new THREE.Mesh(
  new THREE.BoxGeometry(2, 1.6, 1.6),
  new THREE.MeshStandardMaterial({ color: 0xc75a4a })
);
barnBody.position.y = 0.8;
const barnRoof = new THREE.Mesh(
  new THREE.ConeGeometry(1.6, 1, 4),
  new THREE.MeshStandardMaterial({ color: 0x5a3a2a })
);
barnRoof.position.y = 2.1;
barnRoof.rotation.y = Math.PI / 4;
barn.add(barnBody, barnRoof);
barn.position.set(-7, 0, -5);
barn.children.forEach((c) => { c.castShadow = true; c.frustumCulled = false; });
scene.add(barn);

const ROWS = 3, COLS = 4;
const CELL = 1.9;
const plots = [];

const CROPS = {
  trigo: { cost: 5, sell: 12, growMs: 6000, color: 0xffd166, name: "Trigo" },
  milho: { cost: 12, sell: 30, growMs: 12000, color: 0xff9a5a, name: "Milho" }
};

let coins = 40, harvests = 0, selectedSeed = "trigo";

function loadState() {
  const saved = JSON.parse(localStorage.getItem("jogazone-quinta3d") || "null");
  if (saved) { coins = saved.coins; harvests = saved.harvests; }
  document.getElementById("coins").textContent = coins;
  document.getElementById("harvests").textContent = harvests;
}
function saveState() {
  localStorage.setItem("jogazone-quinta3d", JSON.stringify({ coins, harvests }));
}

function plantMesh(cropKey, stage) {
  const crop = CROPS[cropKey];
  const scale = 0.3 + stage * 0.35;
  const mesh = new THREE.Mesh(
    new THREE.ConeGeometry(0.3 * scale, 0.9 * scale, 8),
    new THREE.MeshStandardMaterial({ color: crop.color, roughness: 0.6 })
  );
  mesh.position.y = 0.45 * scale;
  mesh.castShadow = true;
  mesh.frustumCulled = false;
  return mesh;
}

function buildPlots() {
  const offsetX = -((COLS - 1) * CELL) / 2;
  const offsetZ = -((ROWS - 1) * CELL) / 2;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const soil = new THREE.Mesh(
        new THREE.BoxGeometry(CELL - 0.2, 0.15, CELL - 0.2),
        new THREE.MeshStandardMaterial({ color: 0x6b4a2a, roughness: 1 })
      );
      const x = offsetX + c * CELL, z = offsetZ + r * CELL + 1;
      soil.position.set(x, 0.07, z);
      soil.receiveShadow = true;
      soil.frustumCulled = false;
      scene.add(soil);

      const plot = { x, z, crop: null, plantedAt: 0, plantMeshObj: null, soil };
      soil.userData.plotIndex = plots.length;
      plots.push(plot);
    }
  }
}
buildPlots();

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouse = new THREE.Vector2(
    ((e.clientX - rect.left) / rect.width) * 2 - 1,
    -((e.clientY - rect.top) / rect.height) * 2 + 1
  );
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(scene.children, false);
  if (!hits.length) return;

  for (const hit of hits) {
    const idx = hit.object.userData.plotIndex;
    if (idx !== undefined) { onPlotClick(plots[idx]); return; }
    if (hit.object.userData.parentPlotIndex !== undefined) { onPlotClick(plots[hit.object.userData.parentPlotIndex]); return; }
  }
});

function onPlotClick(plot) {
  if (!plot.crop) {
    const crop = CROPS[selectedSeed];
    if (coins < crop.cost) {
      document.getElementById("status").textContent = "Moedas insuficientes para essa semente.";
      return;
    }
    coins -= crop.cost;
    document.getElementById("coins").textContent = coins;
    plot.crop = selectedSeed;
    plot.plantedAt = performance.now();
    plot.plantMeshObj = plantMesh(selectedSeed, 0);
    plot.plantMeshObj.position.x = plot.x;
    plot.plantMeshObj.position.z = plot.z;
    plot.plantMeshObj.userData.parentPlotIndex = plots.indexOf(plot);
    scene.add(plot.plantMeshObj);
    document.getElementById("status").textContent = `${CROPS[selectedSeed].name} plantado. Aguarda que cresça...`;
    saveState();
  } else {
    const crop = CROPS[plot.crop];
    const elapsed = performance.now() - plot.plantedAt;
    if (elapsed < crop.growMs) {
      document.getElementById("status").textContent = "Ainda não está pronto a colher.";
      return;
    }
    coins += crop.sell;
    harvests++;
    document.getElementById("coins").textContent = coins;
    document.getElementById("harvests").textContent = harvests;
    document.getElementById("status").textContent = `Colhido! +${crop.sell} moedas.`;
    scene.remove(plot.plantMeshObj);
    plot.plantMeshObj = null;
    plot.crop = null;
    saveState();
  }
}

["trigo", "milho"].forEach((key) => {
  document.getElementById("seed-" + key).addEventListener("click", () => {
    selectedSeed = key;
    document.querySelectorAll("#shop button").forEach((b) => b.classList.remove("active"));
    document.getElementById("seed-" + key).classList.add("active");
  });
});
document.getElementById("seed-trigo").classList.add("active");

function update() {
  const now = performance.now();
  plots.forEach((plot) => {
    if (plot.crop && plot.plantMeshObj) {
      const crop = CROPS[plot.crop];
      const progress = Math.min(1, (now - plot.plantedAt) / crop.growMs);
      const scale = 0.5 + progress * 1.1;
      plot.plantMeshObj.scale.setScalar(scale);
      plot.plantMeshObj.material.emissive = plot.plantMeshObj.material.emissive || new THREE.Color(0);
      plot.plantMeshObj.material.emissiveIntensity = progress >= 1 ? 0.4 : 0;
      plot.plantMeshObj.material.emissive.setHex(progress >= 1 ? 0xffffff : 0x000000);
    }
  });
}

function animate() {
  update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

loadState();
animate();
