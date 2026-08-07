const COLS = 8, ROWS = 6;
const SYMBOLS = ["🀄", "🎋", "🌸", "🍁", "🌙", "☀️", "⭐", "🔥", "💧", "🌿", "🍀", "🌊",
  "🐉", "🐼", "🦋", "🐢", "🎴", "🏮", "🎐", "🪭", "🌺", "🍄", "🎯", "💎"];

let layer0, layer1, selected, removedCount, totalPairs;

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildLayout() {
  // layer1 (topo): retangulo central 4x4 = 16 posicoes
  const layer1Positions = [];
  for (let r = 1; r <= 4; r++) for (let c = 2; c <= 5; c++) layer1Positions.push(r + "," + c);

  // layer0 (base): todas as 48 posicoes da grelha
  const layer0Positions = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) layer0Positions.push(r + "," + c);

  totalPairs = (layer0Positions.length + layer1Positions.length) / 2;
  const symbolPool = [];
  for (let i = 0; i < totalPairs; i++) {
    const sym = SYMBOLS[i % SYMBOLS.length];
    symbolPool.push(sym, sym);
  }
  const shuffled = shuffle(symbolPool);

  layer0 = {};
  layer1 = {};
  let idx = 0;
  layer1Positions.forEach((key) => { layer1[key] = { symbol: shuffled[idx++], removed: false }; });
  layer0Positions.forEach((key) => { layer0[key] = { symbol: shuffled[idx++], removed: false }; });
}

function reset() {
  buildLayout();
  selected = null;
  removedCount = 0;
  document.getElementById("pairs-left").textContent = totalPairs;
  document.getElementById("status").textContent = "";
  render();
}

function isFree(layerObj, key, blockedByLayer1) {
  const tile = layerObj[key];
  if (!tile || tile.removed) return false;
  if (blockedByLayer1 && layer1[key] && !layer1[key].removed) return false;
  const [r, c] = key.split(",").map(Number);
  const leftKey = r + "," + (c - 1);
  const rightKey = r + "," + (c + 1);
  const leftBlocked = layerObj[leftKey] && !layerObj[leftKey].removed;
  const rightBlocked = layerObj[rightKey] && !layerObj[rightKey].removed;
  return !leftBlocked || !rightBlocked;
}

function tileFree(layerNum, key) {
  if (layerNum === 1) return isFree(layer1, key, false);
  return isFree(layer0, key, true);
}

function onTileClick(layerNum, key) {
  const layerObj = layerNum === 1 ? layer1 : layer0;
  if (!tileFree(layerNum, key)) return;

  if (selected && selected.layer === layerNum && selected.key === key) {
    selected = null;
    render();
    return;
  }

  if (selected) {
    const selObj = selected.layer === 1 ? layer1 : layer0;
    if (selObj[selected.key].symbol === layerObj[key].symbol) {
      selObj[selected.key].removed = true;
      layerObj[key].removed = true;
      removedCount++;
      document.getElementById("pairs-left").textContent = totalPairs - removedCount;
      selected = null;
      if (removedCount === totalPairs) {
        document.getElementById("status").textContent = "🎉 Ganhaste!";
        setTimeout(() => alert("Parabéns! Removeste todos os pares."), 100);
      } else if (!hasMovesLeft()) {
        document.getElementById("status").textContent = "😕 Sem jogadas possíveis. Tenta um novo jogo.";
      }
    } else {
      selected = { layer: layerNum, key };
    }
  } else {
    selected = { layer: layerNum, key };
  }
  render();
}

function hasMovesLeft() {
  const freeSymbols = {};
  [[layer1, 1], [layer0, 0]].forEach(([layerObj, layerNum]) => {
    Object.keys(layerObj).forEach((key) => {
      if (tileFree(layerNum, key)) {
        const sym = layerObj[key].symbol;
        freeSymbols[sym] = (freeSymbols[sym] || 0) + 1;
      }
    });
  });
  return Object.values(freeSymbols).some((count) => count >= 2);
}

function render() {
  const board = document.getElementById("board");
  board.innerHTML = "";
  const CELL = 44;

  Object.keys(layer0).forEach((key) => {
    const tile = layer0[key];
    if (tile.removed) return;
    const [r, c] = key.split(",").map(Number);
    const el = document.createElement("div");
    el.className = "mj-tile layer0" + (tileFree(0, key) ? "" : " blocked");
    if (selected && selected.layer === 0 && selected.key === key) el.classList.add("selected");
    el.style.left = c * CELL + "px";
    el.style.top = r * CELL + "px";
    el.textContent = tile.symbol;
    el.addEventListener("click", () => onTileClick(0, key));
    board.appendChild(el);
  });

  Object.keys(layer1).forEach((key) => {
    const tile = layer1[key];
    if (tile.removed) return;
    const [r, c] = key.split(",").map(Number);
    const el = document.createElement("div");
    el.className = "mj-tile layer1" + (tileFree(1, key) ? "" : " blocked");
    if (selected && selected.layer === 1 && selected.key === key) el.classList.add("selected");
    el.style.left = (c * CELL + 10) + "px";
    el.style.top = (r * CELL + 8) + "px";
    el.textContent = tile.symbol;
    el.addEventListener("click", () => onTileClick(1, key));
    board.appendChild(el);
  });
}

document.getElementById("restart-btn").addEventListener("click", reset);
reset();
