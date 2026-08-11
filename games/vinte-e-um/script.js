const SUITS = [
  { symbol: "♠", color: "black" },
  { symbol: "♥", color: "red" },
  { symbol: "♦", color: "red" },
  { symbol: "♣", color: "black" },
];
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

const dealerCardsEl = document.getElementById("dealer-cards");
const playerCardsEl = document.getElementById("player-cards");
const dealerTotalEl = document.getElementById("dealer-total");
const playerTotalEl = document.getElementById("player-total");
const statusEl = document.getElementById("status");
const winsEl = document.getElementById("wins");
const lossesEl = document.getElementById("losses");
const dealBtn = document.getElementById("deal-btn");
const hitBtn = document.getElementById("hit-btn");
const standBtn = document.getElementById("stand-btn");

let deck, playerHand, dealerHand, wins, losses, phase;

function buildDeck() {
  const d = [];
  SUITS.forEach((s) => RANKS.forEach((r) => d.push({ rank: r, suit: s })));
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}

function cardValue(card) {
  if (card.rank === "A") return 11;
  if (["J", "Q", "K"].includes(card.rank)) return 10;
  return parseInt(card.rank, 10);
}

function handTotal(hand) {
  let total = hand.reduce((sum, c) => sum + cardValue(c), 0);
  let aces = hand.filter((c) => c.rank === "A").length;
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

function reset() {
  wins = 0;
  losses = 0;
  winsEl.textContent = 0;
  lossesEl.textContent = 0;
  startRound();
}

function startRound() {
  deck = buildDeck();
  playerHand = [deck.pop(), deck.pop()];
  dealerHand = [deck.pop(), deck.pop()];
  phase = "player";
  statusEl.textContent = "A tua vez: pede carta ou para";
  hitBtn.disabled = false;
  standBtn.disabled = false;
  dealBtn.disabled = true;
  render();

  if (handTotal(playerHand) === 21) {
    endRound();
  }
}

function render(revealDealer) {
  playerCardsEl.innerHTML = "";
  playerHand.forEach((c) => playerCardsEl.appendChild(makeCardEl(c)));
  playerTotalEl.textContent = `Total: ${handTotal(playerHand)}`;

  dealerCardsEl.innerHTML = "";
  dealerHand.forEach((c, i) => {
    if (i === 1 && !revealDealer && phase === "player") {
      dealerCardsEl.appendChild(makeHiddenCardEl());
    } else {
      dealerCardsEl.appendChild(makeCardEl(c));
    }
  });
  dealerTotalEl.textContent = (revealDealer || phase !== "player")
    ? `Total: ${handTotal(dealerHand)}`
    : `Total: ${cardValue(dealerHand[0])} + ?`;
}

function makeCardEl(card) {
  const el = document.createElement("div");
  el.className = "vu-card " + card.suit.color;
  el.textContent = card.rank + card.suit.symbol;
  return el;
}

function makeHiddenCardEl() {
  const el = document.createElement("div");
  el.className = "vu-card hidden";
  return el;
}

hitBtn.addEventListener("click", () => {
  if (phase !== "player") return;
  playerHand.push(deck.pop());
  render();
  if (handTotal(playerHand) >= 21) {
    endRound();
  }
});

standBtn.addEventListener("click", () => {
  if (phase !== "player") return;
  endRound();
});

function endRound() {
  phase = "dealer";
  hitBtn.disabled = true;
  standBtn.disabled = true;
  const playerTotal = handTotal(playerHand);

  if (playerTotal > 21) {
    finishRound("Rebentaste! A banca vence.", false);
    return;
  }

  while (handTotal(dealerHand) < 17) {
    dealerHand.push(deck.pop());
  }
  render(true);
  const dealerTotal = handTotal(dealerHand);

  if (dealerTotal > 21) {
    finishRound("A banca rebentou! Tu venceste 🎉", true);
  } else if (dealerTotal > playerTotal) {
    finishRound(`A banca venceu (${dealerTotal} vs ${playerTotal}).`, false);
  } else if (playerTotal > dealerTotal) {
    finishRound(`Venceste! (${playerTotal} vs ${dealerTotal}) 🎉`, true);
  } else {
    finishRound(`Empate (${playerTotal}).`, null);
  }
}

function finishRound(message, playerWon) {
  render(true);
  statusEl.textContent = message;
  if (playerWon === true) { wins++; winsEl.textContent = wins; }
  else if (playerWon === false) { losses++; lossesEl.textContent = losses; }
  dealBtn.disabled = false;
  phase = "over";
}

dealBtn.addEventListener("click", startRound);

reset();
