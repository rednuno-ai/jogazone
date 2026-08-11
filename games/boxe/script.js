const playerBar = document.getElementById("player-bar");
const cpuBar = document.getElementById("cpu-bar");
const cueEl = document.getElementById("cue");
const timerFill = document.getElementById("timer-fill");

const PUNCH_WINDOW = 1.1;
const GUARD_WINDOW = 1.0;

let playerHP, cpuHP, cue, over, spawnDelay, waitTimer;

function reset() {
  playerHP = 100;
  cpuHP = 100;
  over = false;
  cue = null;
  spawnDelay = 1.2;
  waitTimer = 1;
  updateBars();
  cueEl.textContent = "Prepara-te...";
  timerFill.style.width = "100%";
}

function updateBars() {
  playerBar.style.width = Math.max(0, playerHP) + "%";
  cpuBar.style.width = Math.max(0, cpuHP) + "%";
}

function spawnCue() {
  const type = Math.random() < 0.55 ? "punch" : "guard";
  cue = { type, timeLeft: type === "punch" ? PUNCH_WINDOW : GUARD_WINDOW, total: type === "punch" ? PUNCH_WINDOW : GUARD_WINDOW };
  cueEl.textContent = type === "punch" ? "SOCA! (ESPAÇO)" : "DEFENDE! (S)";
  cueEl.style.color = type === "punch" ? "#ffd166" : "#5da9ff";
}

function resolveTimeout() {
  if (cue.type === "guard") {
    playerHP -= 20;
    updateBars();
  }
  cue = null;
  waitTimer = spawnDelay;
  cueEl.textContent = "...";
  cueEl.style.color = "#eef0fb";
}

function checkGameOver() {
  if (cpuHP <= 0) {
    over = true;
    cueEl.textContent = "Venceste o combate! 🎉";
    cueEl.style.color = "#7ee8b5";
  } else if (playerHP <= 0) {
    over = true;
    cueEl.textContent = "Foste nocauteado.";
    cueEl.style.color = "#ff5d73";
  }
}

window.addEventListener("keydown", (e) => {
  if (over || !cue) return;
  if (e.code === "Space") {
    e.preventDefault();
    if (cue.type === "punch") {
      const speedBonus = Math.round((cue.timeLeft / cue.total) * 8);
      cpuHP -= 10 + speedBonus;
      cueEl.textContent = "Acertaste!";
      cueEl.style.color = "#7ee8b5";
    } else {
      playerHP -= 12;
      cueEl.textContent = "Erro! Apanhaste um contra-ataque.";
      cueEl.style.color = "#ff5d73";
    }
    updateBars();
    cue = null;
    waitTimer = spawnDelay;
    checkGameOver();
  } else if (e.code === "KeyS") {
    if (cue.type === "guard") {
      cueEl.textContent = "Bloqueaste!";
      cueEl.style.color = "#7ee8b5";
    } else {
      cueEl.textContent = "Perdeste o ritmo.";
    }
    cue = null;
    waitTimer = spawnDelay;
  }
});

function update(dt) {
  if (over) return;

  if (cue) {
    cue.timeLeft -= dt;
    timerFill.style.width = Math.max(0, (cue.timeLeft / cue.total) * 100) + "%";
    if (cue.timeLeft <= 0) {
      resolveTimeout();
      checkGameOver();
    }
  } else {
    waitTimer -= dt;
    timerFill.style.width = "100%";
    if (waitTimer <= 0) {
      spawnCue();
      spawnDelay = Math.max(0.6, spawnDelay - 0.02);
    }
  }
}

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  update(dt);
  requestAnimationFrame(loop);
}

reset();
requestAnimationFrame(loop);
