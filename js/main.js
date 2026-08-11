const CATEGORY_VAR = {
  "Puzzle": "--cat-puzzle",
  "Arcade": "--cat-arcade",
  "Ação": "--cat-acao",
  "Tabuleiro": "--cat-tabuleiro",
  "Palavras": "--cat-palavras",
  "Camiões": "--cat-camioes",
  "3D": "--cat-3d",
  "Desporto": "--cat-desporto"
};

const FEATURED_IDS = ["nebulosa", "palavra-secreta", "domino", "basquete3d", "gemas-magicas", "curling"];
const NEW_IDS = ["pesca", "concurso-latas", "escalada-montanha", "batalha-pioes", "labirinto-giratorio", "pendulo-maluco", "minigolfe3d", "sudoku-classico"];

function renderChips() {
  const wrap = document.getElementById("chips");
  wrap.innerHTML = CATEGORIES.map(
    (c, i) => `<div class="chip${i === 0 ? " active" : ""}" data-cat="${c}">${c}</div>`
  ).join("");
}

function cardHTML(g, index) {
  const catVar = CATEGORY_VAR[g.category] || "--accent";
  const isNew = NEW_IDS.includes(g.id);
  return `
    <a class="game-card" href="${g.path}" style="animation-delay:${Math.min(index, 10) * 30}ms">
      <div class="cover">${gameCoverSVG(g)}
        <span class="badge" style="background:color-mix(in srgb, var(${catVar}) 55%, rgba(0,0,0,.55));border-color:color-mix(in srgb, var(${catVar}) 40%, transparent)">${g.category}</span>
        ${isNew ? '<span class="badge new">Novo</span>' : ""}
      </div>
      <div class="info">
        <h3>${g.title}</h3>
        <p>${g.desc}</p>
        ${g.credit ? `<p class="credit">${g.credit}</p>` : ""}
      </div>
    </a>`;
}

function renderFeatured() {
  const grid = document.getElementById("featured-grid");
  if (!grid) return;
  const items = FEATURED_IDS.map((id) => GAMES.find((g) => g.id === id)).filter(Boolean);
  grid.innerHTML = items.map((g, i) => cardHTML(g, i)).join("");
}

function renderGrid(filterCat, query) {
  const grid = document.getElementById("game-grid");
  const q = (query || "").trim().toLowerCase();

  const items = GAMES.filter((g) => {
    const matchesCat = !filterCat || filterCat === "Todos" || g.category === filterCat;
    const matchesQuery = !q || g.title.toLowerCase().includes(q) || g.desc.toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  if (items.length === 0) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-icon">🔎</div>Nenhum jogo encontrado. Tenta outra pesquisa ou categoria.</div>`;
    return;
  }

  grid.innerHTML = items.map((g, i) => cardHTML(g, i)).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  renderChips();
  renderFeatured();
  renderGrid("Todos", "");

  function applyFilter(cat) {
    document.querySelectorAll(".chip").forEach((c) => c.classList.toggle("active", c.dataset.cat === cat));
    const search = document.getElementById("search-input").value;
    renderGrid(cat, search);
  }

  document.getElementById("chips").addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    applyFilter(chip.dataset.cat);
    document.getElementById("jogos").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  document.getElementById("footer-cats").addEventListener("click", (e) => {
    const link = e.target.closest("a[data-cat]");
    if (!link) return;
    applyFilter(link.dataset.cat);
  });

  document.getElementById("search-input").addEventListener("input", (e) => {
    const activeChip = document.querySelector(".chip.active");
    renderGrid(activeChip ? activeChip.dataset.cat : "Todos", e.target.value);
  });

  document.getElementById("game-count").textContent = GAMES.length;
});
