// Corrida a Dois — física de carro e colisão em grelha adaptadas de js-Racing
// por Gaëtan Blaise-Cazalet (MIT). https://github.com/Gaetz/js-Racing
// Os gráficos (pista, carros, meta) foram redesenhados de raiz em canvas,
// sem usar nenhum dos ficheiros de imagem originais.

const FPS = 30;

const CAR_RADIUS = 10;
const CAR_ACCEL = 0.5;
const CAR_BRAKE = 0.3;
const CAR_TURN = 0.03 * Math.PI;
const SPEED_DECAY = 0.94;
const MIN_TURN_SPEED = 0.5;
const MIN_SPEED = 0.1;
const BOUNCE_TIMER = 15;

const CELL = 40;
const COLS = 20;
const ROWS = 15;

// 0 estrada, 1 parede, 2 partida P1, 10 partida P2, 3 meta, 4 seta, 5 relva
const TRACK = [
5,5,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,5,
5,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,
1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,
1,0,0,0,1,1,1,5,5,5,5,1,1,1,1,1,1,0,0,1,
1,0,0,1,1,0,0,1,5,5,1,1,0,0,0,1,1,0,0,1,
1,0,0,1,0,0,0,0,1,5,1,0,0,0,0,0,1,0,0,1,
1,0,0,1,0,0,0,0,0,1,1,0,0,0,0,0,1,0,0,1,
1,0,0,1,0,0,0,0,0,0,1,0,0,4,0,0,1,0,0,1,
1,0,0,1,0,0,4,0,0,0,4,0,0,1,0,0,1,0,0,1,
1,2,10,1,0,0,1,1,0,0,0,0,0,1,0,0,4,0,0,1,
1,1,1,1,0,0,1,1,0,0,0,0,0,1,0,0,0,0,0,1,
1,3,0,0,0,0,1,1,1,0,0,0,1,1,0,0,0,0,0,1,
1,3,0,0,0,0,1,5,1,1,1,1,1,1,1,0,0,0,1,1,
1,1,1,1,1,1,1,5,5,5,5,5,5,5,1,1,1,1,1,5
];

const COLORS = {
  grass: '#163a24',
  road: '#1c2138',
  wall: '#ff5d73',
  goal1: '#eef0fb',
  goal2: '#10131f',
  flag: '#ffd166',
  car1: '#ff5d73',
  car2: '#5da9ff'
};

let canvas, ctx, car1, car2, input, startP1, startP2, running;

function cellCenter(col, row) {
  return { x: col * CELL + CELL / 2, y: row * CELL + CELL / 2 };
}

function trackCode(col, row) {
  if (col < 0 || row < 0 || col >= COLS || row >= ROWS) return 1;
  return TRACK[row * COLS + col];
}

function makeCar(x, y, color) {
  return {
    x, y, color,
    speed: 0,
    angle: -Math.PI / 2,
    bounceTimer: 0,
    getNextX() { return this.x + Math.cos(this.angle) * this.speed; },
    getNextY() { return this.y + Math.sin(this.angle) * this.speed; },
    update(keys) {
      if (this.bounceTimer > 0) {
        this.bounceTimer--;
      } else {
        if (keys.up) this.speed += CAR_ACCEL;
        if (keys.down) this.speed -= CAR_BRAKE;
        if (keys.left && Math.abs(this.speed) > MIN_TURN_SPEED) this.angle -= CAR_TURN;
        if (keys.right && Math.abs(this.speed) > MIN_TURN_SPEED) this.angle += CAR_TURN;
      }
      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed;
      this.speed = Math.abs(this.speed) > MIN_SPEED ? this.speed * SPEED_DECAY : 0;
      if (this.y <= 0 || this.y >= canvas.height) this.speed *= -1;
      if (this.x <= 0 || this.x >= canvas.width) this.speed *= -1;
    },
    bounce() {
      this.bounceTimer = BOUNCE_TIMER;
      this.speed *= -0.5;
    },
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(-7, 6);
      ctx.lineTo(-4, 0);
      ctx.lineTo(-7, -6);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  };
}

function drawTrack() {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const code = TRACK[row * COLS + col];
      const x = col * CELL, y = row * CELL;
      if (code === 5) {
        ctx.fillStyle = COLORS.grass;
        ctx.fillRect(x, y, CELL, CELL);
        ctx.fillStyle = 'rgba(255,255,255,.05)';
        ctx.fillRect(x + 6, y + 6, 3, 3);
        ctx.fillRect(x + 22, y + 18, 3, 3);
        ctx.fillRect(x + 14, y + 28, 3, 3);
      } else if (code === 1) {
        ctx.fillStyle = COLORS.road;
        ctx.fillRect(x, y, CELL, CELL);
        ctx.fillStyle = COLORS.wall;
        ctx.fillRect(x + 3, y + 3, CELL - 6, CELL - 6);
        ctx.fillStyle = COLORS.road;
        ctx.fillRect(x + 7, y + 7, CELL - 14, CELL - 14);
      } else if (code === 3) {
        for (let i = 0; i < 4; i++) {
          for (let j = 0; j < 4; j++) {
            ctx.fillStyle = (i + j) % 2 === 0 ? COLORS.goal1 : COLORS.goal2;
            ctx.fillRect(x + i * (CELL / 4), y + j * (CELL / 4), CELL / 4, CELL / 4);
          }
        }
      } else if (code === 4) {
        ctx.fillStyle = COLORS.road;
        ctx.fillRect(x, y, CELL, CELL);
        ctx.fillStyle = COLORS.flag;
        ctx.beginPath();
        ctx.moveTo(x + 10, y + 8);
        ctx.lineTo(x + 32, y + 20);
        ctx.lineTo(x + 10, y + 32);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillStyle = COLORS.road;
        ctx.fillRect(x, y, CELL, CELL);
      }
    }
  }
}

function checkWallCollision(car) {
  const col = Math.floor(car.getNextX() / CELL);
  const row = Math.floor(car.getNextY() / CELL);
  if (trackCode(col, row) === 1) car.bounce();
}

function checkGoal(car) {
  const col = Math.floor(car.x / CELL);
  const row = Math.floor(car.y / CELL);
  return trackCode(col, row) === 3;
}

function findStarts() {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const code = TRACK[row * COLS + col];
      if (code === 2) startP1 = cellCenter(col, row);
      if (code === 10) startP2 = cellCenter(col, row);
    }
  }
}

function resetRace(message) {
  car1.x = startP1.x; car1.y = startP1.y; car1.speed = 0; car1.angle = -Math.PI / 2;
  car2.x = startP2.x; car2.y = startP2.y; car2.speed = 0; car2.angle = -Math.PI / 2;
  document.getElementById('race-status').textContent = message || 'Prontos... Partida!';
}

function loop() {
  car1.update(input.p1);
  car2.update(input.p2);
  checkWallCollision(car1);
  checkWallCollision(car2);

  if (checkGoal(car1)) { resetRace('🏁 Jogador 1 venceu!'); }
  else if (checkGoal(car2)) { resetRace('🏁 Jogador 2 venceu!'); }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawTrack();
  car1.draw();
  car2.draw();

  if (running) requestAnimationFrame(loop);
}

function setupInput() {
  const keys = {
    p1: { up: false, down: false, left: false, right: false },
    p2: { up: false, down: false, left: false, right: false }
  };
  const map = {
    KeyW: ['p1', 'up'], KeyS: ['p1', 'down'], KeyA: ['p1', 'left'], KeyD: ['p1', 'right'],
    ArrowUp: ['p2', 'up'], ArrowDown: ['p2', 'down'], ArrowLeft: ['p2', 'left'], ArrowRight: ['p2', 'right']
  };
  window.addEventListener('keydown', (e) => {
    const m = map[e.code];
    if (m) { keys[m[0]][m[1]] = true; e.preventDefault(); }
  });
  window.addEventListener('keyup', (e) => {
    const m = map[e.code];
    if (m) { keys[m[0]][m[1]] = false; e.preventDefault(); }
  });
  return keys;
}

function init() {
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');
  canvas.width = COLS * CELL;
  canvas.height = ROWS * CELL;

  findStarts();
  car1 = makeCar(startP1.x, startP1.y, COLORS.car1);
  car2 = makeCar(startP2.x, startP2.y, COLORS.car2);
  input = setupInput();
  running = true;
  loop();
}

init();
