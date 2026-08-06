const CATS = [
  { key: "1", label: "Uns" }, { key: "2", label: "Doses" }, { key: "3", label: "Treses" },
  { key: "4", label: "Quatros" }, { key: "5", label: "Cincos" }, { key: "6", label: "Seis" },
  { key: "trinca", label: "Trinca (3 iguais)" },
  { key: "sequencia", label: "Sequência" },
  { key: "tudo", label: "Tudo Igual" }
];

let dice, held, rollNum, used, total, best;

function loadBest() {
  best = Number(localStorage.getItem("jogazone-dados-best") || 0);
  document.getElementById("best").textContent = best;
}

function newTurn() {
  dice = [1, 1, 1, 1, 1].map(() => 1 + Math.floor(Math.random() * 6));
  held = [false, false, false, false, false];
  rollNum = 1;
  document.getElementById("roll-num").textContent = rollNum;
  renderDice();
  renderCategories();
}

function reset() {
  used = {};
  total = 0;
  document.getElementById("total").textContent = 0;
  newTurn();
}

function renderDice() {
  const wrap = document.getElementById("dice");
  wrap.innerHTML = "";
  dice.forEach((val, i) => {
    const el = document.createElement("div");
    el.className = "die" + (held[i] ? " held" : "");
    el.textContent = val;
    el.addEventListener("click", () => {
      if (rollNum === 0) return;
      held[i] = !held[i];
      renderDice();
    });
    wrap.appendChild(el);
  });
  document.getElementById("roll-btn").disabled = rollNum >= 3;
  document.getElementById("roll-btn").textContent = rollNum >= 3 ? "Escolhe uma categoria" : `Lançar dados (${3 - rollNum} restantes)`;
}

document.getElementById("roll-btn").addEventListener("click", () => {
  if (rollNum >= 3) return;
  dice = dice.map((v, i) => (held[i] ? v : 1 + Math.floor(Math.random() * 6)));
  rollNum++;
  document.getElementById("roll-num").textContent = rollNum;
  renderDice();
  renderCategories();
});

function computeScore(catKey) {
  const counts = {};
  dice.forEach((v) => (counts[v] = (counts[v] || 0) + 1));
  if (["1", "2", "3", "4", "5", "6"].includes(catKey)) {
    const n = Number(catKey);
    return (counts[n] || 0) * n;
  }
  if (catKey === "trinca") {
    const hasTriple = Object.values(counts).some((c) => c >= 3);
    return hasTriple ? dice.reduce((a, b) => a + b, 0) : 0;
  }
  if (catKey === "sequencia") {
    const unique = [...new Set(dice)].sort((a, b) => a - b);
    let maxRun = 1, run = 1;
    for (let i = 1; i < unique.length; i++) {
      run = unique[i] === unique[i - 1] + 1 ? run + 1 : 1;
      maxRun = Math.max(maxRun, run);
    }
    return maxRun >= 5 ? 40 : maxRun >= 4 ? 30 : 0;
  }
  if (catKey === "tudo") {
    return Object.values(counts).some((c) => c === 5) ? 50 : 0;
  }
  return 0;
}

function renderCategories() {
  const wrap = document.getElementById("categories");
  wrap.innerHTML = "";
  CATS.forEach((cat) => {
    const btn = document.createElement("button");
    btn.className = "dice-cat-btn";
    const usedVal = used[cat.key];
    const preview = usedVal !== undefined ? usedVal : computeScore(cat.key);
    btn.innerHTML = `${cat.label}<strong>${preview}</strong>`;
    btn.disabled = usedVal !== undefined;
    btn.addEventListener("click", () => scoreCategory(cat.key));
    wrap.appendChild(btn);
  });
}

function scoreCategory(key) {
  if (used[key] !== undefined) return;
  const score = computeScore(key);
  used[key] = score;
  total += score;
  document.getElementById("total").textContent = total;

  if (Object.keys(used).length === CATS.length) {
    if (total > best) {
      best = total;
      localStorage.setItem("jogazone-dados-best", String(best));
      document.getElementById("best").textContent = best;
    }
    setTimeout(() => alert(`Jogo terminado! Pontuação final: ${total}`), 100);
    return;
  }
  newTurn();
}

document.getElementById("roll-btn").addEventListener("click", () => {}); // no-op placeholder to avoid dup listener issues
loadBest();
reset();
