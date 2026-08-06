// Meteoros — adaptado de Asteroids.js por James Socol (licença BSD-2-Clause).
// https://github.com/jsocol/asteroids
// Lógica do jogo inalterada (vetores, colisão, gerações de asteroides);
// textos traduzidos para português e paleta de cores ajustada ao JogaZone.

GAME_HEIGHT = 480;
GAME_WIDTH = 640;
FRAME_PERIOD = 60;
LEVEL_TIMEOUT = 2000;

ROTATE_SPEED = Math.PI/10;
MAX_SPEED = 15;
THRUST_ACCEL = 1;
DEATH_TIMEOUT = 2000;
INVINCIBLE_TIMEOUT = 1500;
PLAYER_LIVES = 3;
POINTS_PER_SHOT = 1;
POINTS_TO_EXTRA_LIFE = 1000;

BULLET_SPEED = 20;
MAX_BULLETS = 3;
MAX_BULLET_AGE = 25;

ASTEROID_COUNT = 2;
ASTEROID_GENERATIONS = 3;
ASTEROID_CHILDREN = 2;
ASTEROID_SPEED = 3;
ASTEROID_SCORE = 10;


var Meteoros = function(home) {
    this.log_level = Meteoros.LOG_DEBUG;
    this.log = Meteoros.logger(this);

    home.innerHTML = '';
    this.info = Meteoros.infoPane(this, home);
    this.playfield = Meteoros.playfield(this, home);
    this.player = Meteoros.player(this);

    this.keyState = Meteoros.keyState(this);
    this.listen = Meteoros.listen(this);

    this.asteroids = Meteoros.asteroids(this);
    this.overlays = Meteoros.overlays(this);
    this.highScores = Meteoros.highScores(this);
    this.level = Meteoros.level(this);
    this.gameOver = Meteoros.gameOver(this);

    Meteoros.play(this);
    return this;
}

Meteoros.infoPane = function(game, home) {
    var pane = document.createElement('div');
    pane.className = 'meteoros-hud';

    var lives = document.createElement('span');
    lives.className = 'lives';
    lives.innerHTML = 'VIDAS: ' + PLAYER_LIVES;

    var score = document.createElement('span');
    score.className = 'score';
    score.innerHTML = 'PONTOS: 0';

    var level = document.createElement('span');
    level.className = 'level';
    level.innerHTML = 'NÍVEL: 1';

    pane.appendChild(lives);
    pane.appendChild(score);
    pane.appendChild(level);
    home.appendChild(pane);

    return {
        setLives: function(game, l) {
            lives.innerHTML = 'VIDAS: ' + l;
        },
        setScore: function(game, s) {
            score.innerHTML = 'PONTOS: ' + s;
        },
        setLevel: function(game, _level) {
            level.innerHTML = 'NÍVEL: ' + _level;
        },
        getPane: function() {
            return pane;
        }
    }
}

Meteoros.playfield = function(game, home) {
    var canvas = document.createElement('canvas');
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;
    home.appendChild(canvas);
    return canvas;
}

Meteoros.logger = function(game) {
    if (typeof console != 'undefined' &&
        typeof console.log != 'undefined') {
        return {
            info: function(msg) {
                if (game.log_level <= Meteoros.LOG_INFO)
                    console.log(msg);
            },
            debug: function(msg) {
                if (game.log_level <= Meteoros.LOG_DEBUG)
                    console.log(msg);
            },
            warning: function(msg) {
                if (game.log_level <= Meteoros.LOG_WARNING)
                    console.log(msg);
            },
            error: function(msg) {
                if (game.log_level <= Meteoros.LOG_ERROR)
                    console.log(msg);
            },
            critical: function(msg) {
                if (game.log_level <= Meteoros.LOG_CRITICAL)
                    console.log(msg);
            }
        }
    }
    else {
        return {
            info: function(msg){},
            debug: function(msg){},
            warning: function(msg){},
            error: function(msg){},
            critical: function(msg){},
        }
    }
}

Meteoros.asteroids = function(game) {
    var asteroids = [];

    return {
        push: function(obj) {
            return asteroids.push(obj);
        },
        pop: function() {
            return asteroids.pop();
        },
        splice: function(i, j) {
            return asteroids.splice(i, j);
        },
        get length() {
            return asteroids.length;
        },
        getIterator: function() {
            return asteroids;
        },
        generationCount: function(_gen) {
            var total = 0;
            for (var i=0; i<asteroids.length; i++) {
                if (asteroids[i].getGeneration() == _gen)
                    total++;
            }
            game.log.debug('Found ' + total + ' asteroids in generation ' +
                           _gen);
            return total;
        }
    }
}

Meteoros.overlays = function(game) {
    var overlays = [];

    return {
        draw: function(ctx) {
            for (var i=0; i<overlays.length; i++) {
                overlays[i].draw(ctx);
            }
        },
        add: function(obj) {
            if (-1 == overlays.indexOf(obj) &&
                typeof obj.draw != 'undefined') {
                overlays.push(obj);
                return true;
            }
            return false;
        },
        remove: function(obj) {
            var i = overlays.indexOf(obj);
            if (-1 != i) {
                overlays.splice(i, 1);
                return true;
            }
            return false;
        }
    }
}

Meteoros.player = function(game) {
    var position = [GAME_WIDTH/2, GAME_HEIGHT/2],
        velocity = [0, 0],
        direction = -Math.PI/2,
        dead = false,
        invincible = false,
        lastRez = null,
        lives = PLAYER_LIVES,
        score = 0,
        radius = 3,
        path = [
            [10, 0],
            [-5, 5],
            [-5, -5],
            [10, 0],
        ];

    return {
        getPosition: function() {
            return position;
        },
        getVelocity: function() {
            return velocity;
        },
        getSpeed: function() {
            return Math.sqrt(Math.pow(velocity[0], 2) + Math.pow(velocity[1], 2));
        },
        getDirection: function() {
            return direction;
        },
        getRadius: function() {
            return radius;
        },
        getScore: function() {
            return score;
        },
        addScore: function(pts) {
            score += pts;
        },
        lowerScore: function(pts) {
            score -= pts;
            if (score < 0) {
                score = 0;
            }
        },
        getLives: function() {
            return lives;
        },
        rotate: function(rad) {
            if (!dead) {
                direction += rad;
                game.log.info(direction);
            }
        },
        thrust: function(force) {
            if (!dead) {
                velocity[0] += force * Math.cos(direction);
                velocity[1] += force * Math.sin(direction);

                if (this.getSpeed() > MAX_SPEED) {
                    velocity[0] = MAX_SPEED * Math.cos(direction);
                    velocity[1] = MAX_SPEED * Math.sin(direction);
                }

                game.log.info(velocity);
            }
        },
        move: function() {
            Meteoros.move(position, velocity);
        },
        draw: function(ctx) {
            let color = '#eef0fb';
            if (invincible) {
                const dt = ((new Date) - lastRez) / 200;
                const c = Math.floor(Math.cos(dt) * 16).toString(16);
                color = `#${c}${c}${c}`;
            }
            Meteoros.drawPath(ctx, position, direction, 1, path, color);
        },
        isDead: function() {
            return dead;
        },
        isInvincible: function() {
            return invincible;
        },
        extraLife: function(game) {
            game.log.debug('Woo, extra life!');
            lives++;
        },
        die: function(game) {
            if (!dead) {
                game.log.info('You died!');
                dead = true;
                invincible = true;
                lives--;
                position = [GAME_WIDTH/2, GAME_HEIGHT/2];
                velocity = [0, 0];
                direction = -Math.PI/2;
                if (lives > 0) {
                    setTimeout(function (player, _game) {
                        return function() {
                            player.resurrect(_game);
                        }
                    }(this, game), DEATH_TIMEOUT);
                }
                else {
                    game.gameOver();
                }
            }
        },
        resurrect: function(game) {
            if (dead) {
                dead = false;
                invincible = true;
                lastRez = new Date;
                setTimeout(function () {
                    invincible = false;
                    game.log.debug('No longer invincible!');
                }, INVINCIBLE_TIMEOUT);
                game.log.debug('You ressurrected!');
            }
        },
        fire: function(game) {
            if (!dead) {
                game.log.debug('You fired!');
                var _pos = [position[0], position[1]],
                    _dir = direction;

                this.lowerScore(POINTS_PER_SHOT);

                return Meteoros.bullet(game, _pos, _dir);
            }
        }
    }
}

Meteoros.bullet = function(game, _pos, _dir) {
    var position = [_pos[0], _pos[1]],
        velocity = [0, 0],
        direction = _dir,
        age = 0,
        radius = 1,
        path = [
            [0, 0],
            [-4, 0],
        ];

    velocity[0] = BULLET_SPEED * Math.cos(_dir);
    velocity[1] = BULLET_SPEED * Math.sin(_dir);

    return {
        getPosition: function() {
            return position;
        },
        getVelocity: function() {
            return velocity;
        },
        getSpeed: function() {
            return Math.sqrt(Math.pow(velocity[0], 2) + Math.pow(velocity[1], 2));
        },
        getRadius: function() {
            return radius;
        },
        getAge: function() {
            return age;
        },
        birthday: function() {
            age++;
        },
        move: function() {
            Meteoros.move(position, velocity);
        },
        draw: function(ctx) {
            Meteoros.drawPath(ctx, position, direction, 1, path, '#ffd166');
        },
    }
}

Meteoros.keyState = function(_) {
    var state = {
        [Meteoros.LEFT]: false,
        [Meteoros.UP]: false,
        [Meteoros.RIGHT]: false,
        [Meteoros.DOWN]: false,
        [Meteoros.FIRE]: false
    };

    return {
        on: function(key) {
            state[key] = true;
        },
        off: function(key) {
            state[key] = false;
        },
        getState: function(key) {
            if (typeof state[key] != 'undefined')
                return state[key];
            return false;
        }
    }
}

Meteoros.listen = function(game) {
    const keyMap = {
        "ArrowLeft": Meteoros.LEFT,
        "KeyA": Meteoros.LEFT,
        "ArrowRight": Meteoros.RIGHT,
        "KeyD": Meteoros.RIGHT,
        "ArrowUp": Meteoros.UP,
        "KeyW": Meteoros.UP,
        "Space": Meteoros.FIRE
    };

    window.addEventListener('keydown', function(e) {
        const state = keyMap[e.code];
        if (state) {
            e.preventDefault();
            e.stopPropagation();
            game.keyState.on(state);
            return false;
        }
        return true;
    }, true);

    window.addEventListener('keyup', function(e) {
        const state = keyMap[e.code];
        if (state) {
            e.preventDefault();
            e.stopPropagation();
            game.keyState.off(state);
            return false;
        }
        return true;
    }, true);
}

Meteoros.asteroid = function (game, _gen) {
    var position = [0, 0],
        velocity = [0, 0],
        direction = 0,
        generation = _gen,
        radius = 7,
        path = [
            [1, 7],
            [5, 5],
            [7, 1],
            [5, -3],
            [7, -7],
            [3, -9],
            [-1, -5],
            [-4, -2],
            [-8, -1],
            [-9, 3],
            [-5, 5],
            [-1, 3],
            [1, 7]
        ];

    return {
        getPosition: function() {
            return position;
        },
        setPosition: function(pos) {
            position = pos;
        },
        getVelocity: function() {
            return velocity;
        },
        setVelocity: function(vel) {
            velocity = vel;
            direction = Math.atan2(vel[1], vel[0]);
        },
        getSpeed: function() {
            return Math.sqrt(Math.pow(velocity[0], 2) + Math.pow(velocity[1], 2));
        },
        getRadius: function() {
            return radius * generation;
        },
        getGeneration: function() {
            return generation;
        },
        move: function() {
            Meteoros.move(position, velocity);
        },
        draw: function(ctx) {
            Meteoros.drawPath(ctx, position, direction, generation, path, '#7ee8b5');
        }
    }
}

Meteoros.collision = function (a, b) {
    var a_pos = a.getPosition(),
        b_pos = b.getPosition();

    function sq (x) {
        return Math.pow(x, 2);
    }

    var distance = Math.sqrt(sq(a_pos[0] - b_pos[0]) +
                             sq(a_pos[1] - b_pos[1]));

    if (distance <= a.getRadius() + b.getRadius())
        return true;
    return false;
}

Meteoros.level = function(game) {
    var level = 0,
        speed = ASTEROID_SPEED,
        hspeed = ASTEROID_SPEED/2;

    return {
        getLevel: function() {
            return level;
        },
        levelUp: function(game) {
            level++;
            game.log.debug('Congrats! On to level ' + level);
            while (game.asteroids.generationCount(ASTEROID_GENERATIONS) <
                   level+ASTEROID_COUNT) {
                var a = Meteoros.asteroid(game, ASTEROID_GENERATIONS);
                a.setPosition([Math.random() * GAME_WIDTH,
                               Math.random() * GAME_HEIGHT]);
                a.setVelocity([Math.random() * speed - hspeed,
                               Math.random() * speed - hspeed]);
                game.asteroids.push(a);
            }
        },
    }
}

Meteoros.gameOver = function (game) {
    return function () {
        game.log.debug('Game over!');

        if (game.player.getScore() > 0) {
            game.highScores.addScore('Jogador', game.player.getScore());
        }

        game.overlays.add({
            draw: function (ctx) {
                ctx.fillStyle = '#eef0fb';
                ctx.font = '30px "Segoe UI", monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.fillText('FIM DE JOGO', GAME_WIDTH/2, GAME_HEIGHT/2);

                var scores = game.highScores.getScores();
                ctx.font = '12px "Segoe UI", monospace';
                for (var i=0; i<scores.length; i++) {
                    ctx.fillText(scores[i].name + '   ' + scores[i].score,
                                 GAME_WIDTH/2, GAME_HEIGHT/2 + 20 + 14 * i);
                }
            },
        });
    }
}

Meteoros.highScores = function (game) {
    var scores = [];

    if (t = localStorage.getItem('jogazone-meteoros-scores')) {
        scores = JSON.parse(t);
    }

    return {
        getScores: function() {
            return scores;
        },
        addScore: function(_name, _score) {
            scores.push({name: _name, score: _score});
            scores.sort(function(a, b){ return b.score - a.score; });
            if (scores.length > 10) {
                scores.length = 10;
            }
            game.log.debug('Saving high scores.');
            var str = JSON.stringify(scores);
            localStorage.setItem('jogazone-meteoros-scores', str);
        },
    }
}

Meteoros.drawPath = function (ctx, position, direction, scale, path, color) {
    if (!color) {
        color = '#eef0fb';
    }
    ctx.strokeStyle = color;
    ctx.setTransform(Math.cos(direction) * scale, Math.sin(direction) * scale,
                     -Math.sin(direction) * scale, Math.cos(direction) * scale,
                     position[0], position[1]);

    ctx.beginPath();
    ctx.moveTo(path[0][0], path[0][1]);
    for (i=1; i<path.length; i++) {
        ctx.lineTo(path[i][0], path[i][1]);
    }
    ctx.stroke();
    ctx.closePath();
    ctx.strokeStyle = '#eef0fb';
}

Meteoros.move = function (position, velocity) {
    position[0] += velocity[0];
    if (position[0] < 0)
        position[0] = GAME_WIDTH + position[0];
    else if (position[0] > GAME_WIDTH)
        position[0] -= GAME_WIDTH;

    position[1] += velocity[1];
    if (position[1] < 0)
        position[1] = GAME_HEIGHT + position[1];
    else if (position[1] > GAME_HEIGHT)
        position[1] -= GAME_HEIGHT;
}

Meteoros.stars = function () {
    var stars = [];
    for (var i=0; i<50; i++) {
        stars.push([Math.random()*GAME_WIDTH, Math.random()*GAME_HEIGHT]);
    }

    return {
        draw: function(ctx) {
            ctx.fillStyle = '#eef0fb';
            var ii = stars.length;
            for(var i=0; i<ii; i++) {
                ctx.fillRect(stars[i][0], stars[i][1], 1, 1);
            }
        }
    }
}

Meteoros.play = function (game) {
    var ctx = game.playfield.getContext('2d');
    ctx.fillStyle = '#eef0fb';
    ctx.strokeStyle = '#eef0fb';

    var speed = ASTEROID_SPEED,
        hspeed = ASTEROID_SPEED/2;

    game.level.levelUp(game);

    var bullets = [],
        last_fire_state = false,
        last_asteroid_count = 0;

    var extra_lives = 0;

    game.overlays.add(Meteoros.stars());

    game.pulse = setInterval(function(){
        var kill_asteroids = [],
            new_asteroids = [],
            kill_bullets = [];

        ctx.save();
        ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        var t_extra_lives = game.player.getScore() / POINTS_TO_EXTRA_LIFE;
        t_extra_lives = Math.floor(t_extra_lives);
        if (t_extra_lives > extra_lives) {
            game.player.extraLife(game);
        }
        extra_lives = t_extra_lives;

        if (game.keyState.getState(Meteoros.UP)) {
            game.player.thrust(THRUST_ACCEL);
        }

        if (game.keyState.getState(Meteoros.LEFT)) {
            game.player.rotate(-ROTATE_SPEED);
        }

        if (game.keyState.getState(Meteoros.RIGHT)) {
            game.player.rotate(ROTATE_SPEED);
        }

        var fire_state = game.keyState.getState(Meteoros.FIRE);
        if (fire_state &&
            (fire_state != last_fire_state) &&
            (bullets.length < MAX_BULLETS)) {
            var b = game.player.fire(game);
            bullets.push(b);
        }
        last_fire_state = fire_state;

        if (!game.player.isDead()) {
            game.player.move();
            game.player.draw(ctx);
        }

        for (var k=0; k<bullets.length; k++) {
            if (!bullets[k])
                continue;

            if (bullets[k].getAge() > MAX_BULLET_AGE) {
                kill_bullets.push(k);
                continue;
            }
            bullets[k].birthday();
            bullets[k].move();
            bullets[k].draw(ctx);
        }

        for (var r=kill_bullets.length-1; r>=0; r--) {
            bullets.splice(r, 1);
        }

        var asteroids = game.asteroids.getIterator();
        for (var i=0; i<game.asteroids.length; i++) {
            var killit = false;
            asteroids[i].move();
            asteroids[i].draw(ctx);

            for (var j=0; j<bullets.length; j++) {
                if (!bullets[j])
                    continue;
                if (Meteoros.collision(bullets[j], asteroids[i])) {
                    game.log.debug('You shot an asteroid!');
                    bullets.splice(j, 1);
                    killit = true;
                    continue;
                }
            }

            if (killit) {
                var _gen = asteroids[i].getGeneration() - 1;
                if (_gen > 0) {
                    for (var n=0; n<ASTEROID_CHILDREN; n++) {
                        var a = Meteoros.asteroid(game, _gen);
                        var _pos = [asteroids[i].getPosition()[0],
                                    asteroids[i].getPosition()[1]];
                        a.setPosition(_pos);
                        a.setVelocity([Math.random() * speed - hspeed,
                                       Math.random() * speed - hspeed]);
                        new_asteroids.push(a);
                    }
                }
                game.player.addScore(ASTEROID_SCORE);
                kill_asteroids.push(i);
                continue;
            }

            if (!game.player.isDead() &&
                !game.player.isInvincible() &&
                Meteoros.collision(game.player, asteroids[i])) {
                game.player.die(game);
            }
        }

        kill_asteroids.sort(function(a, b) { return a - b; });
        for (var m=kill_asteroids.length-1; m>=0; m--) {
            game.asteroids.splice(kill_asteroids[m], 1);
        }

        for (var o=0; o<new_asteroids.length; o++) {
            game.asteroids.push(new_asteroids[o]);
        }

        ctx.restore();

        if (0 == game.asteroids.length &&
            last_asteroid_count != 0) {
            setTimeout(function() {
                game.level.levelUp(game);
            }, LEVEL_TIMEOUT);
        }

        last_asteroid_count = game.asteroids.length;

        game.overlays.draw(ctx);

        game.info.setLives(game, game.player.getLives());
        game.info.setScore(game, game.player.getScore());
        game.info.setLevel(game, game.level.getLevel());
    }, FRAME_PERIOD);
}

Meteoros.LOG_ALL = 0;
Meteoros.LOG_INFO = 1;
Meteoros.LOG_DEBUG = 2;
Meteoros.LOG_WARNING = 3;
Meteoros.LOG_ERROR = 4;
Meteoros.LOG_CRITICAL = 5;
Meteoros.LOG_NONE = 6;

Meteoros.LEFT = 37;
Meteoros.UP = 38;
Meteoros.RIGHT = 39;
Meteoros.DOWN = 40;
Meteoros.FIRE = 32;
