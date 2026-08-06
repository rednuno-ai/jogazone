let state = {
  money: 0,
  clickPower: 1,
  perSec: 0,
  brushCost: 10,
  jetCost: 50,
  staffCost: 200
};

function load() {
  const saved = localStorage.getItem("jogazone-truckwash");
  if (saved) state = JSON.parse(saved);
  render();
}

function save() {
  localStorage.setItem("jogazone-truckwash", JSON.stringify(state));
}

function render() {
  document.getElementById("money").textContent = Math.floor(state.money);
  document.getElementById("click-power").textContent = state.clickPower;
  document.getElementById("per-sec").textContent = state.perSec;
  document.getElementById("cost-brush").textContent = state.brushCost;
  document.getElementById("cost-jet").textContent = state.jetCost;
  document.getElementById("cost-staff").textContent = state.staffCost;

  document.getElementById("buy-brush").disabled = state.money < state.brushCost;
  document.getElementById("buy-jet").disabled = state.money < state.jetCost;
  document.getElementById("buy-staff").disabled = state.money < state.staffCost;
}

document.getElementById("wash-truck").addEventListener("click", () => {
  state.money += state.clickPower;
  render();
  save();
});

document.getElementById("buy-brush").addEventListener("click", () => {
  if (state.money < state.brushCost) return;
  state.money -= state.brushCost;
  state.clickPower += 1;
  state.brushCost = Math.round(state.brushCost * 1.6);
  render();
  save();
});

document.getElementById("buy-jet").addEventListener("click", () => {
  if (state.money < state.jetCost) return;
  state.money -= state.jetCost;
  state.perSec += 1;
  state.jetCost = Math.round(state.jetCost * 1.7);
  render();
  save();
});

document.getElementById("buy-staff").addEventListener("click", () => {
  if (state.money < state.staffCost) return;
  state.money -= state.staffCost;
  state.perSec += 5;
  state.staffCost = Math.round(state.staffCost * 1.8);
  render();
  save();
});

setInterval(() => {
  if (state.perSec > 0) {
    state.money += state.perSec / 10;
    render();
  }
}, 100);

setInterval(save, 5000);

load();
