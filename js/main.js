function renderChips() {
  const wrap = document.getElementById("chips");
  wrap.innerHTML = CATEGORIES.map(
    (c, i) => `<div class="chip${i === 0 ? " active" : ""}" data-cat="${c}">${c}</div>`
  ).join("");
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
    grid.innerHTML = `<div class="empty-state">Nenhum jogo encontrado. Tenta outra pesquisa.</div>`;
    return;
  }

  grid.innerHTML = items
    .map(
      (g) => `
      <a class="game-card" href="${g.path}">
        <div class="cover">${gameCoverSVG(g)}<span class="badge">${g.category}</span></div>
        <div class="info">
          <h3>${g.title}</h3>
          <p>${g.desc}</p>
          ${g.credit ? `<p class="credit">${g.credit}</p>` : ""}
        </div>
      </a>`
    )
    .join("");
}

document.addEventListener("DOMContentLoaded", () => {
  renderChips();
  renderGrid("Todos", "");

  document.getElementById("chips").addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    document.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    const search = document.getElementById("search-input").value;
    renderGrid(chip.dataset.cat, search);
  });

  document.getElementById("search-input").addEventListener("input", (e) => {
    const activeChip = document.querySelector(".chip.active");
    renderGrid(activeChip ? activeChip.dataset.cat : "Todos", e.target.value);
  });

  document.getElementById("game-count").textContent = GAMES.length;
});
