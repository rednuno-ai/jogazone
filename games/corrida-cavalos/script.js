const HORSE_COLORS = ["#ff5d73", "#5da9ff", "#7ee8b5", "#ffd166", "#c792ea"];
const FINISH = 100;
const BOOST_AMOUNT = 3.2;
const BOOST_COOLDOWN = 0.12;

const pickerEl = document.getElementById("picker");
const trackEl = document.getElementById("track");
const boostBtn = document.getElementById("boost-btn");
const winsEl = document.getElementById("wins");
const racesEl = document.getElementById("races");

let horses, mine, racing, over, wins, races, boostCooldown;

function reset() {
  horses = HORSE_COLORS.map((color, i) => ({
    id: i, color, progress: 0, speed: 8 + Math.random() * 2, changeTimer: 0,
  }));
  mine = null;
  racing = false;
  over = false;
  boostCooldown = 0;
  wins = parseInt(localStorage.getItem("jogazone-corrida-cavalos-wins") || "0", 10);
  races = parseInt(localStorage.getItem("jogazone-corrida-cavalos-races") || "0", 10);
  winsEl.textContent = wins;
  racesEl.textContent = races;
  boostBtn.disabled = true;
  renderPicker();
  renderTrack();
}

function renderPicker() {
  pickerEl.innerHTML = "";
  horses.forEach((h) => {
    const btn = document.createElement("button");
    btn.className = "cc-pick-btn" + (mine === h.id ? " chosen" : "");
    btn.style.background = h.color;
    btn.textContent = `Cavalo ${h.id + 1}`;
    btn.disabled = racing;
    btn.addEventListener("click", () => {
      mine = h.id;
      renderPicker();
      boostBtn.disabled = false;
      startRace();
    });
    pickerEl.appendChild(btn);
  });
}

function startRace() {
  if (racing) return;
  racing = true;
  over = false;
  renderPicker();
}

function boost() {
  if (!racing || over || mine === null || boostCooldown > 0) return;
  horses[mine].progress += BOOST_AMOUNT;
  boostCooldown = BOOST_COOLDOWN;
}

boostBtn.addEventListener("click", boost);
window.addEventListener("keydown", (e) => {
  if (e.code === "Space") { e.preventDefault(); boost(); }
});

function update(dt) {
  if (!racing || over) return;
  boostCooldown = Math.max(0, boostCooldown - dt);

  horses.forEach((h) => {
    if (h.id === mine) {
      h.progress += h.speed * 0.4 * dt;
      return;
    }
    h.changeTimer -= dt;
    if (h.changeTimer <= 0) {
      h.speed = 6 + Math.random() * 6;
      h.changeTimer = 0.3 + Math.random() * 0.5;
    }
    h.progress += h.speed * dt;
  });

  const winner = horses.find((h) => h.progress >= FINISH);
  if (winner) {
    over = true;
    races++;
    if (winner.id === mine) wins++;
    localStorage.setItem("jogazone-corrida-cavalos-wins", String(wins));
    localStorage.setItem("jogazone-corrida-cavalos-races", String(races));
    winsEl.textContent = wins;
    racesEl.textContent = races;
    boostBtn.disabled = true;
    setTimeout(() => reset(), 2000);
  }
  renderTrack();
}

function renderTrack() {
  trackEl.innerHTML = "";
  horses.forEach((h) => {
    const lane = document.createElement("div");
    lane.className = "cc-lane";
    const marker = document.createElement("div");
    marker.className = "cc-horse" + (h.id === mine ? " mine" : "");
    marker.style.background = h.color;
    marker.style.left = Math.min(100, (h.progress / FINISH) * 100) + "%";
    marker.textContent = h.id + 1;
    lane.appendChild(marker);
    trackEl.appendChild(lane);
  });
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
