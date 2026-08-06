const CELL = 20;
const COLS = 20;
const ROWS = 20;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let snake, dir, nextDir, food, score, best, loopId, running;

function randomFood() {
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS)
    };
  } while (snake.some((s) => s.x === pos.x && s.y === pos.y));
  return pos;
}

function reset() {
  snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
  dir = { x: 1, y: 0 };
  nextDir = { x: 1, y: 0 };
  food = randomFood();
  score = 0;
  running = true;
  document.getElementById("score").textContent = score;
  best = Number(localStorage.getItem("jogazone-cobra-best") || 0);
  document.getElementById("best").textContent = best;
  clearInterval(loopId);
  loopId = setInterval(tick, 110);
}

function tick() {
  if (!running) return;
  dir = nextDir;
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

  if (head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS || snake.some((s) => s.x === head.x && s.y === head.y)) {
    running = false;
    clearInterval(loopId);
    if (score > best) {
      best = score;
      localStorage.setItem("jogazone-cobra-best", String(best));
      document.getElementById("best").textContent = best;
    }
    draw();
    setTimeout(() => alert(`Perdeste! Pontuação final: ${score}`), 50);
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    document.getElementById("score").textContent = score;
    food = randomFood();
  } else {
    snake.pop();
  }

  draw();
}

function draw() {
  ctx.fillStyle = "#161a2e";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#ff5d73";
  ctx.beginPath();
  ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL / 2.6, 0, Math.PI * 2);
  ctx.fill();

  snake.forEach((s, i) => {
    ctx.fillStyle = i === 0 ? "#7ee8b5" : "#5da9ff";
    ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
  });
}

function setDirection(name) {
  const map = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 }
  };
  const d = map[name];
  if (!d) return;
  if (d.x === -dir.x && d.y === -dir.y) return;
  nextDir = d;
}

window.addEventListener("keydown", (e) => {
  const keyMap = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
    w: "up",
    s: "down",
    a: "left",
    d: "right"
  };
  const name = keyMap[e.key];
  if (name) {
    e.preventDefault();
    setDirection(name);
  }
});

document.getElementById("dpad").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (btn) setDirection(btn.dataset.dir);
});

document.getElementById("restart-btn").addEventListener("click", reset);

reset();
draw();
