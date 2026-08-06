const canvas = document.getElementById("canvas");
const wrap = document.getElementById("scene-wrap");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x141830);

const camera = new THREE.PerspectiveCamera(45, wrap.clientWidth / wrap.clientHeight, 0.1, 100);
camera.position.set(0, 11, 9);
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

scene.add(new THREE.AmbientLight(0xaabbff, 0.9));
const sun = new THREE.DirectionalLight(0xffffff, 1.1);
sun.position.set(6, 12, 6);
sun.castShadow = true;
scene.add(sun);

const TILE_TYPES = {
  GO: "go", PROPERTY: "property", CHANCE: "chance", TAX: "tax"
};

const BOARD = [
  { name: "Início", type: TILE_TYPES.GO, color: 0xffd166 },
  { name: "Rua do Porto", type: TILE_TYPES.PROPERTY, cost: 120, rent: 20, color: 0xff9a5a },
  { name: "Avenida Central", type: TILE_TYPES.PROPERTY, cost: 140, rent: 24, color: 0xff9a5a },
  { name: "Sorte", type: TILE_TYPES.CHANCE, color: 0xc58bff },
  { name: "Praça Nova", type: TILE_TYPES.PROPERTY, cost: 160, rent: 28, color: 0x5da9ff },
  { name: "Imposto", type: TILE_TYPES.TAX, amount: 100, color: 0xff5d73 },
  { name: "Rua da Estação", type: TILE_TYPES.PROPERTY, cost: 180, rent: 32, color: 0x5da9ff },
  { name: "Largo do Mercado", type: TILE_TYPES.PROPERTY, cost: 200, rent: 36, color: 0x7ee8b5 },
  { name: "Sorte", type: TILE_TYPES.CHANCE, color: 0xc58bff },
  { name: "Rua Alta", type: TILE_TYPES.PROPERTY, cost: 220, rent: 40, color: 0x7ee8b5 },
  { name: "Avenida do Rio", type: TILE_TYPES.PROPERTY, cost: 240, rent: 44, color: 0xc58bff },
  { name: "Imposto", type: TILE_TYPES.TAX, amount: 120, color: 0xff5d73 },
  { name: "Bairro Alto", type: TILE_TYPES.PROPERTY, cost: 260, rent: 48, color: 0xc58bff },
  { name: "Praça do Sol", type: TILE_TYPES.PROPERTY, cost: 280, rent: 52, color: 0xffd166 },
  { name: "Sorte", type: TILE_TYPES.CHANCE, color: 0xc58bff },
  { name: "Torre Nova", type: TILE_TYPES.PROPERTY, cost: 320, rent: 60, color: 0xffd166 }
];
const N = BOARD.length;
const SIDE = 4;
const CELL = 2.2;

function tilePos(i) {
  const half = (SIDE - 1) * CELL / 2;
  const side = Math.floor(i / SIDE);
  const posInSide = i % SIDE;
  let x, z;
  if (side === 0) { x = -half + posInSide * CELL; z = -half; }
  else if (side === 1) { x = half; z = -half + posInSide * CELL; }
  else if (side === 2) { x = half - posInSide * CELL; z = half; }
  else { x = -half; z = half - posInSide * CELL; }
  return { x, z };
}

BOARD.forEach((tile, i) => {
  const { x, z } = tilePos(i);
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(CELL - 0.15, 0.25, CELL - 0.15),
    new THREE.MeshStandardMaterial({ color: tile.color, roughness: 0.6 })
  );
  mesh.position.set(x, 0, z);
  mesh.receiveShadow = true;
  mesh.frustumCulled = false;
  scene.add(mesh);
  tile.mesh = mesh;
  tile.x = x; tile.z = z;
  tile.owner = null;
});

const centerPlate = new THREE.Mesh(
  new THREE.BoxGeometry((SIDE - 1) * CELL - 1, 0.15, (SIDE - 1) * CELL - 1),
  new THREE.MeshStandardMaterial({ color: 0x1c2138, roughness: 0.8 })
);
centerPlate.position.y = -0.05;
centerPlate.frustumCulled = false;
scene.add(centerPlate);

function buildToken(color) {
  const mesh = new THREE.Mesh(
    new THREE.ConeGeometry(0.35, 0.6, 10),
    new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.25 })
  );
  mesh.castShadow = true;
  mesh.frustumCulled = false;
  scene.add(mesh);
  return mesh;
}
const myToken = buildToken(0xff5d73);
const aiToken = buildToken(0x5da9ff);

let myPos, aiPos, myMoney, aiMoney, myTurn, gameOver;

function loadOwnershipReset() {
  BOARD.forEach((t) => {
    t.owner = null;
    t.mesh.material.emissive && (t.mesh.material.emissive.setHex(0x000000));
  });
}

function placeTokens() {
  const p1 = tilePos(myPos);
  myToken.position.set(p1.x - 0.4, 0.4, p1.z + 0.4);
  const p2 = tilePos(aiPos);
  aiToken.position.set(p2.x + 0.4, 0.4, p2.z - 0.4);
}

function reset() {
  myPos = 0; aiPos = 0;
  myMoney = 1500; aiMoney = 1500;
  myTurn = true;
  gameOver = false;
  loadOwnershipReset();
  placeTokens();
  document.getElementById("my-money").textContent = myMoney;
  document.getElementById("ai-money").textContent = aiMoney;
  document.getElementById("status").textContent = "A tua vez — lança o dado!";
  document.getElementById("action-box").innerHTML = "";
  document.getElementById("roll-btn").disabled = false;
}

function ownedColor(baseColor, owner) {
  return owner === "me" ? 0xff5d73 : owner === "ai" ? 0x5da9ff : baseColor;
}

function refreshTileColors() {
  BOARD.forEach((t) => {
    if (t.type === TILE_TYPES.PROPERTY) {
      t.mesh.material.color.setHex(t.owner ? ownedColor(t.color, t.owner) : t.color);
    }
  });
}

function chanceEvent() {
  const events = [
    { text: "Encontraste dinheiro na rua! +80€", amount: 80 },
    { text: "Pagaste uma multa de trânsito. -60€", amount: -60 },
    { text: "Recebeste uma herança pequena! +150€", amount: 150 },
    { text: "Reparação da casa. -100€", amount: -100 },
    { text: "Prémio da lotaria local! +200€", amount: 200 }
  ];
  return events[Math.floor(Math.random() * events.length)];
}

function resolveTile(isMe) {
  const pos = isMe ? myPos : aiPos;
  const tile = BOARD[pos];
  let money = isMe ? myMoney : aiMoney;
  let msg = "";

  if (tile.type === TILE_TYPES.GO) {
    money += 200;
    msg = `Passaste no Início: +200€`;
  } else if (tile.type === TILE_TYPES.TAX) {
    money -= tile.amount;
    msg = `Imposto em ${tile.name}: -${tile.amount}€`;
  } else if (tile.type === TILE_TYPES.CHANCE) {
    const ev = chanceEvent();
    money += ev.amount;
    msg = ev.text;
  } else if (tile.type === TILE_TYPES.PROPERTY) {
    if (!tile.owner) {
      if (isMe) {
        document.getElementById("status").textContent = `${tile.name} está livre. Custa ${tile.cost}€.`;
        const box = document.getElementById("action-box");
        box.innerHTML = "";
        if (myMoney >= tile.cost) {
          const buyBtn = document.createElement("button");
          buyBtn.textContent = `Comprar por ${tile.cost}€`;
          buyBtn.onclick = () => {
            myMoney -= tile.cost;
            tile.owner = "me";
            refreshTileColors();
            document.getElementById("my-money").textContent = myMoney;
            box.innerHTML = "";
            endTurn();
          };
          box.appendChild(buyBtn);
        }
        const skipBtn = document.createElement("button");
        skipBtn.textContent = "Não comprar";
        skipBtn.onclick = () => { box.innerHTML = ""; endTurn(); };
        box.appendChild(skipBtn);
        return;
      } else {
        if (aiMoney >= tile.cost && Math.random() < 0.7) {
          aiMoney -= tile.cost;
          tile.owner = "ai";
          refreshTileColors();
        }
        msg = tile.owner === "ai" ? `O rival comprou ${tile.name}.` : `O rival não comprou ${tile.name}.`;
      }
    } else if (tile.owner !== (isMe ? "me" : "ai")) {
      const rent = tile.rent;
      if (isMe) { myMoney -= rent; aiMoney += rent; }
      else { aiMoney -= rent; myMoney += rent; }
      msg = `${isMe ? "Pagaste" : "O rival pagou"} ${rent}€ de renda em ${tile.name}.`;
    } else {
      msg = `Caíste no teu próprio terreno.`;
    }
  }

  if (isMe) myMoney = money; else aiMoney = money;
  document.getElementById("my-money").textContent = myMoney;
  document.getElementById("ai-money").textContent = aiMoney;
  document.getElementById("status").textContent = msg;
  checkBankruptcy();
  if (!gameOver) endTurn();
}

function checkBankruptcy() {
  if (myMoney < 0) { gameOver = true; endGame("😢 Faliste! O rival venceu."); }
  else if (aiMoney < 0) { gameOver = true; endGame("🎉 O rival faliu! Ganhaste!"); }
}

function endGame(msg) {
  document.getElementById("status").textContent = msg;
  document.getElementById("roll-btn").textContent = "Jogar novamente";
  document.getElementById("roll-btn").disabled = false;
  document.getElementById("roll-btn").onclick = () => { reset(); document.getElementById("roll-btn").textContent = "🎲 Lançar dado"; document.getElementById("roll-btn").onclick = rollHandler; };
}

function endTurn() {
  if (gameOver) return;
  myTurn = !myTurn;
  document.getElementById("roll-btn").disabled = !myTurn;
  if (!myTurn) {
    document.getElementById("status").textContent = "Vez do rival...";
    setTimeout(aiPlay, 900);
  } else {
    document.getElementById("status").textContent = "A tua vez — lança o dado!";
  }
}

function aiPlay() {
  const roll = 1 + Math.floor(Math.random() * 6);
  const newPos = (aiPos + roll) % N;
  if (newPos < aiPos) { aiMoney += 200; }
  aiPos = newPos;
  placeTokens();
  resolveTile(false);
}

function rollHandler() {
  if (!myTurn || gameOver) return;
  document.getElementById("roll-btn").disabled = true;
  const roll = 1 + Math.floor(Math.random() * 6);
  document.getElementById("status").textContent = `Tiraste ${roll}!`;
  const newPos = (myPos + roll) % N;
  if (newPos < myPos) { myMoney += 200; }
  myPos = newPos;
  placeTokens();
  setTimeout(() => resolveTile(true), 400);
}

document.getElementById("roll-btn").addEventListener("click", rollHandler);

function animate() {
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

reset();
animate();
