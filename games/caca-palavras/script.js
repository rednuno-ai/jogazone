const SIZE = 10;
const WORD_POOL = ["SOL", "LUA", "MAR", "CEU", "FLOR", "RIO", "VENTO", "TERRA", "FOGO", "NEVE", "AREIA", "CHUVA"];
const DIRS = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]];

let grid, words, foundWords, selection;

function pickWords() {
  const shuffled = [...WORD_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 8);
}

function tryPlace(g, word) {
  for (let attempt = 0; attempt < 60; attempt++) {
    const [dr, dc] = DIRS[Math.floor(Math.random() * DIRS.length)];
    const r0 = Math.floor(Math.random() * SIZE);
    const c0 = Math.floor(Math.random() * SIZE);
    const rEnd = r0 + dr * (word.length - 1);
    const cEnd = c0 + dc * (word.length - 1);
    if (rEnd < 0 || rEnd >= SIZE || cEnd < 0 || cEnd >= SIZE) continue;

    let ok = true;
    for (let i = 0; i < word.length; i++) {
      const r = r0 + dr * i, c = c0 + dc * i;
      if (g[r][c] !== "" && g[r][c] !== word[i]) { ok = false; break; }
    }
    if (!ok) continue;

    const cells = [];
    for (let i = 0; i < word.length; i++) {
      const r = r0 + dr * i, c = c0 + dc * i;
      g[r][c] = word[i];
      cells.push([r, c]);
    }
    return cells;
  }
  return null;
}

function buildPuzzle() {
  const g = Array.from({ length: SIZE }, () => Array(SIZE).fill(""));
  words = pickWords().map((w) => ({ word: w, cells: null }));
  words.forEach((entry) => { entry.cells = tryPlace(g, entry.word); });
  words = words.filter((entry) => entry.cells);

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (g[r][c] === "") g[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
    }
  }
  return g;
}

function reset() {
  grid = buildPuzzle();
  foundWords = new Set();
  selection = [];
  document.getElementById("total").textContent = words.length;
  document.getElementById("found").textContent = 0;
  renderList();
  renderBoard();
}

function renderList() {
  const ul = document.getElementById("word-list");
  ul.innerHTML = words.map((w) => `<li class="${foundWords.has(w.word) ? "done" : ""}">${w.word}</li>`).join("");
}

function renderBoard() {
  const board = document.getElementById("board");
  board.innerHTML = "";
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const cell = document.createElement("div");
      cell.className = "ws-cell";
      cell.textContent = grid[r][c];
      cell.dataset.r = r;
      cell.dataset.c = c;
      cell.addEventListener("click", () => onCellClick(r, c, cell));
      board.appendChild(cell);
    }
  }
}

function cellsBetween(r0, c0, r1, c1) {
  const dr = Math.sign(r1 - r0), dc = Math.sign(c1 - c0);
  if (r0 !== r1 && c0 !== c1 && Math.abs(r1 - r0) !== Math.abs(c1 - c0)) return null;
  const cells = [];
  let r = r0, c = c0;
  while (true) {
    cells.push([r, c]);
    if (r === r1 && c === c1) break;
    r += dr; c += dc;
    if (cells.length > SIZE) return null;
  }
  return cells;
}

function onCellClick(r, c, el) {
  selection.push({ r, c, el });
  el.classList.add("selected");

  if (selection.length === 2) {
    const [a, b] = selection;
    const path = cellsBetween(a.r, a.c, b.r, b.c);
    if (path) {
      const straight = path.map(([rr, cc]) => grid[rr][cc]).join("");
      const reversed = straight.split("").reverse().join("");
      const match = words.find((w) => !foundWords.has(w.word) && (w.word === straight || w.word === reversed));
      if (match) {
        foundWords.add(match.word);
        document.getElementById("found").textContent = foundWords.size;
        path.forEach(([rr, cc]) => {
          document.querySelector(`.ws-cell[data-r="${rr}"][data-c="${cc}"]`).classList.add("found");
        });
        renderList();
        if (foundWords.size === words.length) {
          setTimeout(() => alert("Encontraste todas as palavras! 🎉"), 100);
        }
      }
    }
    selection.forEach((s) => s.el.classList.remove("selected"));
    selection = [];
  }
}

document.getElementById("restart-btn").addEventListener("click", reset);
reset();
