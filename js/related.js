function shuffleRelated(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function relatedCardHTML(g) {
  return `
    <a class="game-card" href="../../${g.path}">
      <div class="cover">${gameCoverSVG(g)}</div>
      <div class="info">
        <h3>${g.title}</h3>
        <p>${g.desc}</p>
      </div>
    </a>`;
}

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("related-grid");
  if (!container || typeof GAMES === "undefined") return;

  const parts = location.pathname.split("/").filter(Boolean);
  const currentId = parts[parts.length - 2];
  const current = GAMES.find((g) => g.id === currentId);
  if (!current) return;

  const sameCategory = GAMES.filter((g) => g.id !== currentId && g.category === current.category);
  const pool = sameCategory.length >= 4 ? sameCategory : GAMES.filter((g) => g.id !== currentId);
  const picks = shuffleRelated(pool).slice(0, 4);

  container.innerHTML = picks.map(relatedCardHTML).join("");
});
