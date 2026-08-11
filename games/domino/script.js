const handEl = document.getElementById("hand");
const chainEl = document.getElementById("chain");
const statusEl = document.getElementById("status");
const handCountEl = document.getElementById("hand-count");
const cpuCountEl = document.getElementById("cpu-count");
const boneyardCountEl = document.getElementById("boneyard-count");
const drawBtn = document.getElementById("draw-btn");

let playerHand, cpuHand, boneyard, chain, turn, over, passStreak;

function buildSet() {
  const tiles = [];
  for (let i = 0; i <= 6; i++) {
    for (let j = i; j <= 6; j++) tiles.push([i, j]);
  }
  return tiles;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function reset() {
  const deck = shuffle(buildSet());
  playerHand = deck.splice(0, 7);
  cpuHand = deck.splice(0, 7);
  boneyard = deck;
  chain = [];
  turn = "player";
  over = false;
  passStreak = 0;
  statusEl.textContent = "A tua vez";
  render();
}

function ends() {
  if (!chain.length) return { left: null, right: null };
  return { left: chain[0][0], right: chain[chain.length - 1][1] };
}

function playableEnds(tile) {
  const { left, right } = ends();
  if (left === null) return ["any"];
  const options = [];
  if (tile[0] === left || tile[1] === left) options.push("left");
  if (tile[0] === right || tile[1] === right) options.push("right");
  return options;
}

function placeTile(tile, end) {
  const { left, right } = ends();
  if (end === "any") {
    chain.push(tile);
    return;
  }
  if (end === "left") {
    const other = tile[0] === left ? tile[1] : tile[0];
    chain.unshift([other, left]);
  } else {
    const other = tile[1] === right ? tile[0] : tile[1];
    chain.push([right, other]);
  }
}

function removeFromHand(hand, tile) {
  const idx = hand.findIndex((t) => t[0] === tile[0] && t[1] === tile[1]);
  if (idx !== -1) hand.splice(idx, 1);
}

function playerPlay(tile) {
  const opts = playableEnds(tile);
  if (!opts.length) return;
  const end = opts.includes("right") ? "right" : opts[0];
  placeTile(tile, end);
  removeFromHand(playerHand, tile);
  passStreak = 0;
  if (playerHand.length === 0) {
    endGame("player");
    return;
  }
  turn = "cpu";
  render();
  setTimeout(cpuTurn, 500);
}

function cpuTurn() {
  if (over) return;
  let tile = cpuHand.find((t) => playableEnds(t).length);
  while (!tile && boneyard.length) {
    cpuHand.push(boneyard.pop());
    tile = cpuHand.find((t) => playableEnds(t).length);
  }
  if (tile) {
    const opts = playableEnds(tile);
    const end = opts.includes("right") ? "right" : opts[0];
    placeTile(tile, end);
    removeFromHand(cpuHand, tile);
    passStreak = 0;
    if (cpuHand.length === 0) {
      endGame("cpu");
      return;
    }
  } else {
    passStreak++;
    statusEl.textContent = "Computador passou a vez";
  }

  if (passStreak >= 2 && boneyard.length === 0) {
    endGame("block");
    return;
  }

  turn = "player";
  statusEl.textContent = "A tua vez";
  render();
}

function handHasPlay(hand) {
  return hand.some((t) => playableEnds(t).length > 0);
}

drawBtn.addEventListener("click", () => {
  if (over || turn !== "player") return;
  if (handHasPlay(playerHand)) {
    statusEl.textContent = "Já tens uma peça jogável destacada";
    return;
  }
  if (boneyard.length === 0) {
    passStreak++;
    if (passStreak >= 2) {
      endGame("block");
      return;
    }
    turn = "cpu";
    statusEl.textContent = "Sem peças no monte — passas a vez";
    render();
    setTimeout(cpuTurn, 500);
    return;
  }
  playerHand.push(boneyard.pop());
  render();
});

function pipSum(hand) {
  return hand.reduce((s, t) => s + t[0] + t[1], 0);
}

function endGame(winner) {
  over = true;
  if (winner === "player") statusEl.textContent = "Ficaste sem peças — venceste! 🎉";
  else if (winner === "cpu") statusEl.textContent = "O computador ficou sem peças primeiro.";
  else {
    const p = pipSum(playerHand), c = pipSum(cpuHand);
    if (p < c) statusEl.textContent = `Jogo bloqueado! Venceste por pontos (${p} vs ${c}).`;
    else if (c < p) statusEl.textContent = `Jogo bloqueado! O computador venceu por pontos (${c} vs ${p}).`;
    else statusEl.textContent = "Jogo bloqueado! Empate.";
  }
  render();
}

function makeTileEl(tile, horiz) {
  const el = document.createElement("div");
  el.className = "dm-tile" + (horiz ? " horiz" : "");
  const h1 = document.createElement("div");
  h1.className = "dm-half";
  h1.textContent = tile[0];
  const h2 = document.createElement("div");
  h2.className = "dm-half";
  h2.textContent = tile[1];
  el.appendChild(h1);
  el.appendChild(h2);
  return el;
}

function render() {
  handCountEl.textContent = playerHand.length;
  cpuCountEl.textContent = cpuHand.length;
  boneyardCountEl.textContent = boneyard.length;

  chainEl.innerHTML = "";
  chain.forEach((tile) => chainEl.appendChild(makeTileEl(tile, true)));

  handEl.innerHTML = "";
  playerHand.forEach((tile) => {
    const el = makeTileEl(tile, false);
    const opts = playableEnds(tile);
    if (!over && turn === "player" && opts.length) {
      el.classList.add("playable");
      el.addEventListener("click", () => playerPlay(tile));
    }
    handEl.appendChild(el);
  });
}

reset();
