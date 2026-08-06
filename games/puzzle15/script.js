const SIZE = 4;
let tiles, moves, best;

function solvedOrder() {
  const arr = [];
  for (let i = 1; i < SIZE * SIZE; i++) arr.push(i);
  arr.push(0);
  return arr;
}

function isSolvable(arr) {
  const nums = arr.filter((n) => n !== 0);
  let inversions = 0;
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] > nums[j]) inversions++;
    }
  }
  const emptyRowFromBottom = SIZE - Math.floor(arr.indexOf(0) / SIZE);
  if (SIZE % 2 === 0) {
    return (emptyRowFromBottom % 2 === 0) ? inversions % 2 === 1 : inversions % 2 === 0;
  }
  return inversions % 2 === 0;
}

function shuffledTiles() {
  let arr;
  do {
    arr = solvedOrder();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  } while (!isSolvable(arr) || arr.join(",") === solvedOrder().join(","));
  return arr;
}

function reset() {
  tiles = shuffledTiles();
  moves = 0;
  document.getElementById("moves").textContent = moves;
  best = localStorage.getItem("jogazone-puzzle15-best");
  document.getElementById("best").textContent = best || "—";
  render();
}

function render() {
  const board = document.getElementById("board");
  board.innerHTML = "";
  const solved = solvedOrder();
  tiles.forEach((val, idx) => {
    const tile = document.createElement("div");
    tile.className = "slide-tile" + (val === 0 ? " empty" : "") + (val !== 0 && val === solved[idx] ? " solved" : "");
    tile.textContent = val === 0 ? "" : val;
    tile.addEventListener("click", () => onTileClick(idx));
    board.appendChild(tile);
  });
}

function onTileClick(idx) {
  const emptyIdx = tiles.indexOf(0);
  const row = Math.floor(idx / SIZE), col = idx % SIZE;
  const erow = Math.floor(emptyIdx / SIZE), ecol = emptyIdx % SIZE;
  const adjacent = (Math.abs(row - erow) === 1 && col === ecol) || (Math.abs(col - ecol) === 1 && row === erow);
  if (!adjacent) return;

  [tiles[idx], tiles[emptyIdx]] = [tiles[emptyIdx], tiles[idx]];
  moves++;
  document.getElementById("moves").textContent = moves;
  render();

  if (tiles.join(",") === solvedOrder().join(",")) {
    if (!best || moves < Number(best)) {
      localStorage.setItem("jogazone-puzzle15-best", String(moves));
      document.getElementById("best").textContent = moves;
    }
    setTimeout(() => alert(`Resolvido em ${moves} movimentos!`), 100);
  }
}

document.getElementById("restart-btn").addEventListener("click", reset);
reset();
