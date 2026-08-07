const W = 480, H = 220;
const canvas = document.getElementById("canvas");
canvas.width = W; canvas.height = H;
const ctx = canvas.getContext("2d");

const EVENTS = [
  { name: "100 metros", type: "mash", duration: 6000 },
  { name: "Salto em Altura", type: "power" },
  { name: "Lançamento do Peso", type: "powerangle" },
  { name: "200 metros", type: "mash", duration: 9000 },
  { name: "Salto em Comprimento", type: "power" },
  { name: "Lançamento do Dardo", type: "powerangle" },
  { name: "800 metros", type: "mash", duration: 13000 }
];

let eventIdx, results, total, best, state;

function loadBest() {
  best = Number(localStorage.getItem("jogazone-heptatlo-best") || 0);
  document.getElementById("best").textContent = best;
}

// state.phase: "idle" -> "ready" -> "running" -> "ready" (next event) ... -> "finished"
function newState() {
  return { phase: "idle", mashCount: 0, lastKey: null, power: 0, powerDir: 1, angle: 0, angleDir: 1, stage: "power", startTime: 0 };
}

function loadEventUI() {
  const ev = EVENTS[eventIdx];
  document.getElementById("event-num").textContent = eventIdx + 1;
  document.getElementById("event-name").textContent = ev.name;
  document.getElementById("status").textContent = ev.type === "mash"
    ? "Prime \"Começar prova\" e depois alterna ◀ / ▶ o mais rápido possível!"
    : "Prime \"Começar prova\" e depois ESPAÇO para travares a barra no momento certo.";
  document.getElementById("action-btn").textContent = eventIdx === 0 ? "Começar prova" : "Começar prova";
  document.getElementById("action-btn").disabled = false;
  state.phase = "ready";
  state.mashCount = 0; state.lastKey = null;
  state.power = 0; state.powerDir = 1; state.angle = 0; state.angleDir = 1; state.stage = "power";
}

function nextEvent() {
  eventIdx++;
  if (eventIdx >= EVENTS.length) {
    finishGame();
    return;
  }
  loadEventUI();
}

function finishGame() {
  state.phase = "finished";
  if (total > best) {
    best = total;
    localStorage.setItem("jogazone-heptatlo-best", String(best));
    document.getElementById("best").textContent = best;
  }
  document.getElementById("action-btn").style.display = "none";
  document.getElementById("status").textContent = `Heptatlo concluído! Pontuação total: ${total} / 700`;
}

function runCurrentEvent() {
  const ev = EVENTS[eventIdx];
  document.getElementById("action-btn").disabled = true;
  state.phase = "running";
  state.startTime = performance.now();
  if (ev.type === "mash") {
    document.getElementById("status").textContent = "VAI! Alterna ◀ / ▶!";
    setTimeout(finishMash, ev.duration);
  } else {
    document.getElementById("status").textContent = "Prime ESPAÇO para travares a potência!";
  }
}

document.getElementById("action-btn").addEventListener("click", () => {
  if (state.phase === "idle") {
    eventIdx = -1;
    results = [];
    total = 0;
    document.getElementById("total").textContent = 0;
    document.getElementById("action-btn").textContent = "Começar prova";
    nextEvent();
  } else if (state.phase === "ready") {
    runCurrentEvent();
  }
});

window.addEventListener("keydown", (e) => {
  if (state.phase !== "running") return;
  const ev = EVENTS[eventIdx];

  if (ev.type === "mash") {
    if (e.code === "ArrowLeft" || e.code === "ArrowRight") {
      if (e.code !== state.lastKey) {
        state.mashCount++;
        state.lastKey = e.code;
      }
      e.preventDefault();
    }
  } else if (e.code === "Space") {
    e.preventDefault();
    if (ev.type === "power") {
      finishPower(state.power);
    } else if (ev.type === "powerangle") {
      if (state.stage === "power") {
        state.lockedPower = state.power;
        state.stage = "angle";
        document.getElementById("status").textContent = "Agora trava o ângulo!";
      } else {
        finishPowerAngle(state.lockedPower, state.angle);
      }
    }
  }
});

function finishMash() {
  if (state.phase !== "running") return;
  const ev = EVENTS[eventIdx];
  const rate = state.mashCount / (ev.duration / 1000);
  const score = Math.min(100, Math.round(rate * 8));
  recordResult(score, `${state.mashCount} alternâncias`);
}

function finishPower(power) {
  const score = Math.round(power);
  recordResult(score, `${Math.round(power)}% de força`);
}

function finishPowerAngle(power, angle) {
  const optimal = 50;
  const accuracy = 1 - Math.abs(angle - optimal) / 50;
  const score = Math.round(power * Math.max(0.2, accuracy));
  recordResult(score, `força ${Math.round(power)}%, ângulo ${Math.round(angle)}°`);
}

function recordResult(score, detail) {
  state.phase = "ready";
  results.push(score);
  total += score;
  document.getElementById("total").textContent = total;
  document.getElementById("status").textContent = `Resultado: ${score} pontos (${detail})`;
  document.getElementById("action-btn").disabled = true;
  setTimeout(() => {
    nextEvent();
    document.getElementById("action-btn").disabled = false;
    document.getElementById("action-btn").textContent = "Próxima prova";
  }, 1400);
}

function update() {
  if (state.phase !== "running") return;
  const ev = EVENTS[eventIdx];
  if (ev.type === "power" || ev.type === "powerangle") {
    if (ev.type === "powerangle" && state.stage === "angle") {
      state.angle += state.angleDir * 2.2;
      if (state.angle >= 100) { state.angle = 100; state.angleDir = -1; }
      if (state.angle <= 0) { state.angle = 0; state.angleDir = 1; }
    } else {
      state.power += state.powerDir * 2.6;
      if (state.power >= 100) { state.power = 100; state.powerDir = -1; }
      if (state.power <= 0) { state.power = 0; state.powerDir = 1; }
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#1c2138";
  ctx.fillRect(0, 0, W, H);

  if (state.phase === "idle" || state.phase === "finished") {
    ctx.font = "40px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🏟️", W / 2, H / 2 + 15);
    draw._raf = requestAnimationFrame(loop);
    return;
  }

  const ev = EVENTS[eventIdx];
  if (state.phase === "running" && ev.type === "mash") {
    const elapsed = performance.now() - state.startTime;
    const progress = Math.min(1, elapsed / ev.duration);
    ctx.fillStyle = "#5da9ff";
    ctx.fillRect(20, H / 2 - 10, (W - 40) * progress, 20);
    ctx.strokeStyle = "rgba(255,255,255,.3)";
    ctx.strokeRect(20, H / 2 - 10, W - 40, 20);
    ctx.font = "40px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🏃", 20 + (W - 40) * progress, H / 2 - 25);
  } else if (state.phase === "running" && (ev.type === "power" || ev.type === "powerangle")) {
    ctx.fillStyle = "rgba(255,255,255,.1)";
    ctx.fillRect(40, 60, W - 80, 24);
    const val = ev.type === "powerangle" && state.stage === "angle" ? state.angle : state.power;
    ctx.fillStyle = state.stage === "angle" ? "#c58bff" : "#ff5d73";
    ctx.fillRect(40, 60, (W - 80) * (val / 100), 24);
    ctx.strokeStyle = "rgba(255,255,255,.3)";
    ctx.strokeRect(40, 60, W - 80, 24);
    ctx.fillStyle = "#eef0fb";
    ctx.font = "16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(state.stage === "angle" ? "Ângulo" : "Potência", W / 2, 50);
    ctx.font = "40px sans-serif";
    ctx.fillText(ev.type === "powerangle" ? "🏹" : "🤸", W / 2, 140);
  } else {
    ctx.font = "40px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(EVENTS[eventIdx].type === "mash" ? "🏃" : "🏟️", W / 2, H / 2 + 15);
  }
}

function loop() {
  update();
  draw();
}

loadBest();
document.getElementById("status").textContent = 'Prime "Começar" para iniciares o heptatlo.';
state = newState();
setInterval(loop, 1000 / 60);
