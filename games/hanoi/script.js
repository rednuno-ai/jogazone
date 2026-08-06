const N = 4;
const COLORS = ["#ff5d73", "#ffd166", "#7ee8b5", "#5da9ff", "#c58bff"];
let towers, moves, selected;

function reset() {
  towers = [Array.from({ length: N }, (_, i) => N - i), [], []];
  moves = 0;
  selected = null;
  document.getElementById("moves").textContent = 0;
  document.getElementById("minmoves").textContent = Math.pow(2, N) - 1;
  render();
}

function render() {
  const wrap = document.getElementById("towers");
  wrap.innerHTML = "";
  towers.forEach((tower, idx) => {
    const el = document.createElement("div");
    el.className = "hanoi-tower" + (selected === idx ? " selected" : "");
    tower.forEach((size) => {
      const disk = document.createElement("div");
      disk.className = "hanoi-disk";
      disk.style.width = 30 + size * 20 + "px";
      disk.style.background = COLORS[size - 1] || "#fff";
      el.appendChild(disk);
    });
    el.addEventListener("click", () => onTowerClick(idx));
    wrap.appendChild(el);
  });
}

function onTowerClick(idx) {
  if (selected === null) {
    if (towers[idx].length > 0) selected = idx;
  } else if (selected === idx) {
    selected = null;
  } else {
    const from = towers[selected];
    const to = towers[idx];
    const disk = from[from.length - 1];
    if (to.length === 0 || to[to.length - 1] > disk) {
      to.push(from.pop());
      moves++;
      document.getElementById("moves").textContent = moves;
      selected = null;
      if (towers[2].length === N) {
        setTimeout(() => alert(`Resolvido em ${moves} movimentos! (mínimo: ${Math.pow(2, N) - 1})`), 150);
      }
    } else {
      selected = idx;
    }
  }
  render();
}

document.getElementById("restart-btn").addEventListener("click", reset);
reset();
