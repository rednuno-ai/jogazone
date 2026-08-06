const SYMBOLS = ["🍀", "⭐", "🔥", "🌙", "🎯", "🍎", "🎈", "🎲"];

let state = {
  cards: [],
  flipped: [],
  matched: 0,
  moves: 0,
  timerId: null,
  seconds: 0,
  locked: false
};

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatTime(s) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

function startTimer() {
  clearInterval(state.timerId);
  state.seconds = 0;
  document.getElementById("timer").textContent = formatTime(0);
  state.timerId = setInterval(() => {
    state.seconds++;
    document.getElementById("timer").textContent = formatTime(state.seconds);
  }, 1000);
}

function buildBoard() {
  const board = document.getElementById("board");
  board.innerHTML = "";
  state.cards = shuffle([...SYMBOLS, ...SYMBOLS]);
  state.flipped = [];
  state.matched = 0;
  state.moves = 0;
  state.locked = false;
  document.getElementById("moves").textContent = 0;
  document.getElementById("found").textContent = 0;
  document.getElementById("total").textContent = SYMBOLS.length;

  state.cards.forEach((symbol, idx) => {
    const card = document.createElement("div");
    card.className = "memory-card";
    card.dataset.symbol = symbol;
    card.dataset.idx = idx;
    card.innerHTML = `
      <div class="inner">
        <div class="face front"></div>
        <div class="face back">${symbol}</div>
      </div>`;
    card.addEventListener("click", () => onCardClick(card));
    board.appendChild(card);
  });

  startTimer();
}

function onCardClick(card) {
  if (state.locked) return;
  if (card.classList.contains("flipped") || card.classList.contains("matched")) return;
  if (state.flipped.length === 2) return;

  card.classList.add("flipped");
  state.flipped.push(card);

  if (state.flipped.length === 2) {
    state.moves++;
    document.getElementById("moves").textContent = state.moves;
    const [a, b] = state.flipped;
    if (a.dataset.symbol === b.dataset.symbol) {
      a.classList.add("matched");
      b.classList.add("matched");
      state.flipped = [];
      state.matched++;
      document.getElementById("found").textContent = state.matched;
      if (state.matched === SYMBOLS.length) {
        clearInterval(state.timerId);
        setTimeout(() => alert(`Parabéns! Completaste em ${state.moves} jogadas e ${formatTime(state.seconds)}.`), 300);
      }
    } else {
      state.locked = true;
      setTimeout(() => {
        a.classList.remove("flipped");
        b.classList.remove("flipped");
        state.flipped = [];
        state.locked = false;
      }, 800);
    }
  }
}

document.getElementById("restart-btn").addEventListener("click", buildBoard);
buildBoard();
