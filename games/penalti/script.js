const ZONE_POS = [
  [16, 25], [50, 25], [84, 25],
  [16, 70], [50, 70], [84, 70]
];

let score, kick, over;

function reset() {
  score = 0;
  kick = 1;
  over = false;
  document.getElementById("score").textContent = 0;
  document.getElementById("kick-num").textContent = 1;
  document.getElementById("result").textContent = "";
  document.getElementById("ball").style.left = "50%";
  document.getElementById("ball").style.top = "100%";
  document.getElementById("keeper").style.left = "50%";
  document.getElementById("keeper").style.top = "55%";
}

document.querySelectorAll(".zone").forEach((zone) => {
  zone.addEventListener("click", () => shoot(Number(zone.dataset.zone)));
});

function shoot(zoneIdx) {
  if (over) return;
  document.querySelectorAll(".zone").forEach((z) => (z.style.pointerEvents = "none"));

  const [bx, by] = ZONE_POS[zoneIdx];
  document.getElementById("ball").style.left = bx + "%";
  document.getElementById("ball").style.top = by + "%";

  const keeperZone = Math.floor(Math.random() * 6);
  const [kx, ky] = ZONE_POS[keeperZone];
  document.getElementById("keeper").style.left = kx + "%";
  document.getElementById("keeper").style.top = ky + "%";

  setTimeout(() => {
    const saved = keeperZone === zoneIdx;
    const resultEl = document.getElementById("result");
    if (saved) {
      resultEl.textContent = "🧤 Defendido!";
      resultEl.style.color = "var(--accent)";
    } else {
      score++;
      document.getElementById("score").textContent = score;
      resultEl.textContent = "⚽ GOLO!";
      resultEl.style.color = "var(--accent-3)";
    }

    kick++;
    if (kick > 5) {
      over = true;
      setTimeout(() => alert(`Fim da série! Marcaste ${score} de 5 pontapés.`), 300);
    } else {
      document.getElementById("kick-num").textContent = kick;
      setTimeout(() => {
        document.getElementById("ball").style.left = "50%";
        document.getElementById("ball").style.top = "100%";
        document.getElementById("keeper").style.left = "50%";
        document.getElementById("keeper").style.top = "55%";
        document.querySelectorAll(".zone").forEach((z) => (z.style.pointerEvents = "auto"));
      }, 900);
    }
  }, 400);
}

document.getElementById("restart-btn").addEventListener("click", () => {
  reset();
  document.querySelectorAll(".zone").forEach((z) => (z.style.pointerEvents = "auto"));
});
reset();
