const SUITS = [
  { s: "♠", color: "black" }, { s: "♥", color: "red" },
  { s: "♦", color: "red" }, { s: "♣", color: "black" }
];
const RANK_LABELS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

let deck, tableau, foundations, stock, waste, selected, moves;

function buildDeck() {
  const cards = [];
  SUITS.forEach((suit) => {
    for (let rank = 1; rank <= 13; rank++) {
      cards.push({ suit: suit.s, color: suit.color, rank, faceUp: false, id: suit.s + rank });
    }
  });
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

function deal() {
  deck = buildDeck();
  tableau = [[], [], [], [], [], [], []];
  for (let c = 0; c < 7; c++) {
    for (let r = 0; r <= c; r++) {
      const card = deck.pop();
      card.faceUp = r === c;
      tableau[c].push(card);
    }
  }
  stock = deck;
  stock.forEach((c) => (c.faceUp = false));
  waste = [];
  foundations = { "♠": [], "♥": [], "♦": [], "♣": [] };
  selected = null;
  moves = 0;
  document.getElementById("moves").textContent = 0;
  document.getElementById("status").textContent = "";
  render();
}

function cardLabel(card) {
  return RANK_LABELS[card.rank - 1] + card.suit;
}

function topOf(pile) { return pile[pile.length - 1]; }

function canStackTableau(card, destTop) {
  if (!destTop) return card.rank === 13;
  return destTop.faceUp && destTop.color !== card.color && destTop.rank === card.rank + 1;
}

function canStackFoundation(card, foundationPile) {
  if (foundationPile.length === 0) return card.rank === 1;
  return topOf(foundationPile).suit === card.suit && topOf(foundationPile).rank === card.rank - 1;
}

function clearSelection() {
  selected = null;
  render();
}

function onStockClick() {
  if (stock.length === 0) {
    stock = waste.reverse();
    stock.forEach((c) => (c.faceUp = false));
    waste = [];
  } else {
    const card = stock.pop();
    card.faceUp = true;
    waste.push(card);
  }
  clearSelection();
}

function selectSource(type, colIdx, cardIdx) {
  if (type === "waste") {
    if (waste.length === 0) return;
    selected = { type: "waste", cards: [topOf(waste)] };
  } else if (type === "tableau") {
    const col = tableau[colIdx];
    const card = col[cardIdx];
    if (!card.faceUp) return;
    const sequence = col.slice(cardIdx);
    for (let i = 0; i < sequence.length - 1; i++) {
      if (sequence[i].color === sequence[i + 1].color || sequence[i].rank !== sequence[i + 1].rank + 1) return;
    }
    selected = { type: "tableau", colIdx, cardIdx, cards: sequence };
  }
  render();
}

function moveSelectedTo(destType, destIdx) {
  if (!selected) return;
  const movingCards = selected.cards;
  const firstCard = movingCards[0];

  if (destType === "foundation") {
    if (movingCards.length !== 1) { clearSelection(); return; }
    const pile = foundations[destIdx];
    if (!canStackFoundation(firstCard, pile)) { clearSelection(); return; }
    pile.push(firstCard);
    removeFromSource();
    moves++;
    document.getElementById("moves").textContent = moves;
  } else if (destType === "tableau") {
    const destCol = tableau[destIdx];
    if (selected.type === "tableau" && selected.colIdx === destIdx) { clearSelection(); return; }
    if (!canStackTableau(firstCard, topOf(destCol))) { clearSelection(); return; }
    destCol.push(...movingCards);
    removeFromSource();
    moves++;
    document.getElementById("moves").textContent = moves;
  }
  selected = null;
  checkWin();
  render();
}

function removeFromSource() {
  if (selected.type === "waste") {
    waste.pop();
  } else if (selected.type === "tableau") {
    const col = tableau[selected.colIdx];
    col.length = selected.cardIdx;
    if (col.length > 0) topOf(col).faceUp = true;
  }
}

function checkWin() {
  const total = Object.values(foundations).reduce((sum, p) => sum + p.length, 0);
  if (total === 52) {
    document.getElementById("status").textContent = "🎉 Ganhaste!";
    setTimeout(() => alert(`Parabéns! Resolvida em ${moves} movimentos.`), 100);
  }
}

function makeCardEl(card, faceDown) {
  const el = document.createElement("div");
  el.className = "pac-card " + (faceDown ? "back" : card.color);
  if (!faceDown) el.textContent = cardLabel(card);
  return el;
}

function render() {
  document.getElementById("stock").innerHTML = "";
  if (stock.length > 0) document.getElementById("stock").appendChild(makeCardEl(null, true));
  document.getElementById("stock").onclick = onStockClick;

  const wasteEl = document.getElementById("waste");
  wasteEl.innerHTML = "";
  if (waste.length > 0) {
    const card = topOf(waste);
    const el = makeCardEl(card, false);
    if (selected && selected.type === "waste") el.classList.add("selected");
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      if (selected) moveSelectedTo(null, null);
      else selectSource("waste");
    });
    wasteEl.appendChild(el);
  }

  const foundationsEl = document.getElementById("foundations");
  foundationsEl.innerHTML = "";
  SUITS.forEach((suit) => {
    const slot = document.createElement("div");
    slot.className = "pac-foundation-slot";
    const pile = foundations[suit.s];
    if (pile.length > 0) slot.appendChild(makeCardEl(topOf(pile), false));
    else slot.textContent = suit.s;
    slot.style.display = "flex";
    slot.style.alignItems = "center";
    slot.style.justifyContent = "center";
    slot.style.opacity = pile.length > 0 ? 1 : 0.4;
    slot.addEventListener("click", () => moveSelectedTo("foundation", suit.s));
    foundationsEl.appendChild(slot);
  });

  const tableauEl = document.getElementById("tableau");
  tableauEl.innerHTML = "";
  tableau.forEach((col, colIdx) => {
    const colEl = document.createElement("div");
    colEl.className = "pac-column";
    if (col.length === 0) {
      const empty = document.createElement("div");
      empty.className = "pac-empty-slot";
      empty.addEventListener("click", () => moveSelectedTo("tableau", colIdx));
      colEl.appendChild(empty);
    }
    col.forEach((card, cardIdx) => {
      const el = makeCardEl(card, !card.faceUp);
      el.style.top = cardIdx * 22 + "px";
      el.style.zIndex = cardIdx;
      if (selected && selected.type === "tableau" && selected.colIdx === colIdx && cardIdx >= selected.cardIdx) {
        el.classList.add("selected");
      }
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        if (selected) moveSelectedTo("tableau", colIdx);
        else selectSource("tableau", colIdx, cardIdx);
      });
      colEl.appendChild(el);
    });
    colEl.style.minHeight = Math.max(100, col.length * 22 + 78) + "px";
    tableauEl.appendChild(colEl);
  });
}

document.getElementById("restart-btn").addEventListener("click", deal);
deal();
