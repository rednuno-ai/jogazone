const SIZE = 8;
const SHIP_SIZES = [5, 4, 3, 3, 2];
let grid, cells, shots, sunkCount, over;

function emptyGrid() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

function canPlace(g, r, c, len, horiz) {
  for (let i = 0; i < len; i++) {
    const rr = horiz ? r : r + i;
    const cc = horiz ? c + i : c;
    if (rr >= SIZE || cc >= SIZE) return false;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = rr + dr, nc = cc + dc;
        if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && g[nr][nc] !== 0) return false;
      }
    }
  }
  return true;
}

function placeShips() {
  const g = emptyGrid();
  const ships = [];
  let shipId = 1;
  for (const len of SHIP_SIZES) {
    let placed = false;
    while (!placed) {
      const horiz = Math.random() < 0.5;
      const r = Math.floor(Math.random() * SIZE);
      const c = Math.floor(Math.random() * SIZE);
      if (canPlace(g, r, c, len, horiz)) {
        const cellsList = [];
        for (let i = 0; i < len; i++) {
          const rr = horiz ? r : r + i;
          const cc = horiz ? c + i : c;
          g[rr][cc] = shipId;
          cellsList.push([rr, cc]);
        }
        ships.push({ id: shipId, cells: cellsList, hits: 0 });
        shipId++;
        placed = true;
      }
    }
  }
  return { g, ships };
}

function reset() {
  const setup = placeShips();
  grid = setup.g;
  window.ships = setup.ships;
  shots = 0;
  sunkCount = 0;
  over = false;
  document.getElementById("shots").textContent = 0;
  document.getElementById("sunk").textContent = 0;
  render();
}

function render() {
  const board = document.getElementById("board");
  board.innerHTML = "";
  cells = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const cell = document.createElement("div");
      cell.className = "naval-cell";
      cell.addEventListener("click", () => onCellClick(r, c, cell));
      board.appendChild(cell);
      cells.push(cell);
    }
  }
}

function onCellClick(r, c, cellEl) {
  if (over || cellEl.classList.contains("hit") || cellEl.classList.contains("miss")) return;
  shots++;
  document.getElementById("shots").textContent = shots;

  const shipId = grid[r][c];
  if (shipId > 0) {
    cellEl.classList.add("hit");
    cellEl.textContent = "🔴";
    const ship = window.ships.find((s) => s.id === shipId);
    ship.hits++;
    if (ship.hits === ship.cells.length) {
      sunkCount++;
      document.getElementById("sunk").textContent = sunkCount;
      ship.cells.forEach(([rr, cc]) => {
        cells[rr * SIZE + cc].classList.add("sunk");
      });
      if (sunkCount === SHIP_SIZES.length) {
        over = true;
        setTimeout(() => alert(`Frota afundada em ${shots} tiros!`), 100);
      }
    }
  } else {
    cellEl.classList.add("miss");
    cellEl.textContent = "⚪";
  }
}

document.getElementById("restart-btn").addEventListener("click", reset);
reset();
