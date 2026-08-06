const arena = document.getElementById("arena");
let score, timeLeft, spawnId, timerId, best;

function loadBest() {
  best = Number(localStorage.getItem("jogazone-reflexo-best") || 0);
  document.getElementById("best").textContent = best;
}

function startGame() {
  document.getElementById("startOverlay").remove();
  score = 0;
  timeLeft = 30;
  document.getElementById("score").textContent = score;
  document.getElementById("timer").textContent = timeLeft;

  spawnTarget();
  timerId = setInterval(() => {
    timeLeft--;
    document.getElementById("timer").textContent = timeLeft;
    if (timeLeft <= 0) endGame();
  }, 1000);
}

function spawnTarget() {
  clearTimeout(spawnId);
  arena.querySelectorAll(".reflex-target").forEach((t) => t.remove());
  if (timeLeft <= 0) return;

  const target = document.createElement("button");
  target.className = "reflex-target";
  const maxX = arena.clientWidth - 46;
  const maxY = arena.clientHeight - 46;
  target.style.left = Math.random() * maxX + "px";
  target.style.top = Math.random() * maxY + "px";
  target.addEventListener("click", () => {
    score++;
    document.getElementById("score").textContent = score;
    spawnTarget();
  });
  arena.appendChild(target);

  spawnId = setTimeout(spawnTarget, 1400);
}

function endGame() {
  clearInterval(timerId);
  clearTimeout(spawnId);
  arena.querySelectorAll(".reflex-target").forEach((t) => t.remove());

  if (score > best) {
    best = score;
    localStorage.setItem("jogazone-reflexo-best", String(best));
    document.getElementById("best").textContent = best;
  }

  const overlay = document.createElement("div");
  overlay.className = "reflex-overlay";
  overlay.innerHTML = `
    <div style="text-align:center;">
      <p style="margin:0 0 12px;font-size:18px;">Pontuação final: <strong>${score}</strong></p>
      <button class="btn" id="start-btn">Jogar novamente</button>
    </div>`;
  arena.appendChild(overlay);
  document.getElementById("start-btn").addEventListener("click", startGame);
}

loadBest();
document.getElementById("start-btn").addEventListener("click", startGame);
