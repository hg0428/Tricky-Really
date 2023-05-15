//move to game engine.
let touchInit = false;
var touchControls = false;
var playerGravity = 40;
var onGround = 0;
var movementMult = 1;
let groundImg = new Image();
let runningLevel;
groundImg.src = '/img/grass.jpg';
GAMES['games/enemy.js'] = function(LEVEL) {
    /*******SETUP********/
    let game = new Game('games/enemy.js', LEVEL);
    game.set('<h3 id="riddle"></h3>');
    game.loadCSS('/css/game.css');
    let Riddle = document.getElementById('riddle');
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.height = document.body.offsetHeight;
    canvas.width = document.body.offsetWidth;
    game.appendChild(canvas);

    function reflect(numberToReflect, reflectionPoint) {
        return reflectionPoint - (numberToReflect - reflectionPoint);
    }
    const shapes = {
        rect: (x, y, w, h) => ctx.fillRect(x, y, w, h),
        groundImage: (x, y, w, h) => ctx.drawImage(groundImg, x, y, w, h),
        triangle: (x, y, w, h) => {
            ctx.beginPath();
            ctx.moveTo(x, y + h); //bottom left
            ctx.lineTo(x + w / 2, y); //middle top
            ctx.lineTo(x + w, y + h); //bottom right
            ctx.closePath();
            ctx.fill();
        },
        V: (x, y, w, h) => {
            //A V shaped shape
            ctx.beginPath();
            // Move to the starting point of the V shape
            ctx.moveTo(x, y);

            // Draw the left side of the V shape
            ctx.lineTo(x + w / 2, y + h);

            // Draw the right side of the V shape
            ctx.lineTo(x + w, y);
            // Stroke the shape to actually draw it on the canvas
            ctx.stroke();
        },
        ellipse: (x, y, w, h) => {
            ctx.beginPath();
            ctx.ellipse(x, y, w, h, 0, 0, 2 * Math.PI);
            ctx.fill()
        }
    } // loadLevel("games/enemy.js", "getthere")
    const Levels = {
        'vinde': {
            riddle: 'You have to win this. Did you know that win is "vinde" in Danish? So, I guess get a V for vinde.',
            setup: function() {
                new Entity({name:'enemy', width:50, height:80, x:200, y:0, color:'grey', draw:shapes.triangle});
                new Entity({name:'enemy', width:50, height:80, x:500, y:0, color:'grey', draw:shapes.triangle});
                new Entity({name:'enemy', width:50, height:80, x:-400, y:0, color:'grey', draw:shapes.triangle});
                new Entity({name:'enemy', width:50, height:80, x:-450, y:0, color:'grey', draw:shapes.triangle});
                player = new Entity({name:'player', width:70, height:70, x:-2200, y:0, color:'green', draw:shapes.rect});
                ground = new Entity({name:'ground', width:6000, height:200, x:100, y:canvas.height / 2 - 100, color:'green', draw:shapes.groundImage, fixed:true, physics: true});
                document.getElementById('controls').innerHTML += '<div class="controlbtn" id="ctrl-V">V</div>';
                document.getElementById('ctrl-V').onclick = function() {
                    game.score = 100;
                    game.complete();
                    game.Continue('You Won!!!', 'green', `Completed in ${game.time / 1000} seconds!`, game);
                    document.getElementById('ctrl-V').remove();
                    setTouch(); //Disable touch controls
                }
            },
            eachFrame: function(elapsed) {
                if (KEYS.pressedKeys.has('v') && LEVEL === 'vinde') {
                    game.score = 100;
                    game.complete();
                    game.Continue('You Won!!!', 'green', `Completed in ${game.time / 1000} seconds!`, game);
                    document.getElementById('ctrl-V').remove();
                    setTouch(); //Disable touch controls
                }
            }
        },
        'getthere': {
            riddle: 'Find the goal.', //Ran out of ideas....
            setup: function() {
                player = new Entity({name:'player', width:70, height:70, x:-2200, y:0, color:'green', draw:shapes.rect});
                ground = new Entity({name:'ground', width:6000, height:200, x:100, y:canvas.height / 2 - 100, color:'green', draw:shapes.groundImage, fixed:true, physics: true});
                let goal = runningLevel.goal = new Entity({name:'goal', width:10, height:300, x:500, y:ground.top - 1000, color:'rgba(0, 255, 40, 0.8)', draw:shapes.rect});
                let spis = [
                    [3, -2000, 'red'],
                    [6, -1800, 'red'],
                    [7, -1200, 'red'],
                    [8, -2400, 'red'],
                    [5, -2600, 'red'],
                    [22, -300, 'red', 82, true]
                ]
                for (let i in spis) {
                    spike = spis[i];
                    new Entity({
                        name:'enemy', width:5 * (spike[0] || 1), height:8 * (spike[0] || 1), x:spike[1] || 100, y:spike[3] || 0, color:spike[2] || 'grey', draw:shapes.triangle, fixed:spike[4] || false});
                }
            },
            eachFrame: function(elapsed) {
                if (player.x > runningLevel.goal.x + runningLevel.goal.width) {
                    game.score = 100;
                    game.complete();
                    game.Continue('You Won!!!', 'green', `Completed in ${game.time / 1000} seconds!`, game);
                    document.getElementById('ctrl-V').remove();
                    setTouch(); //Disable touch controls
                }
            }
        },
        'upsidedown': {
            riddle: 'Oh no! The world is upside down and you need to fix it!',
            setup: function() {
                playerGravity = -40;
                player = new Entity({name:'player', width:70, height:70, x:-2200, y:0, color:'green', draw:shapes.rect});
                ground = new Entity({name:'ground', width:6000, height:200, x:100, y:canvas.height / 2 - 100, color:'green', draw:shapes.groundImage, fixed:true, physics: true});
                runningLevel.toggle = new Entity({name:'toggle', width:50, height:50, x:2800, y:ground.bottom + 75, color:'rgba(0, 255, 40, 0.8)', draw:shapes.ellipse, fixed:true});
                runningLevel.toggle2 = new Entity({name:'toggle2', width:50, height:50, x:100, y:ground.bottom + 75, color:'rgba(255, 40, 0, 0.8)', draw:shapes.ellipse, fixed:true});
                let spis = [
                    [5, -2100, 'red'],
                    [6, -1800, 'red'],
                    [9, -1200, 'red'],
                ]
                new Entity({
                    width: 500, height: 50, x: 400, y: ground.bottom + 70, color: 'black', draw: shapes.rect, fixed: true, physics: true
                });
                new Entity({
                    width: 200, height: 50, x: 400, y: ground.bottom + 25, color: 'black', draw: shapes.rect, fixed: true, physics: true
                });
                new Entity({
                    width: 500, height: 50, x: 850, y: ground.bottom + 170, color: 'black', draw: shapes.rect, fixed: true, physics: true
                });
                new Entity({
                    width: 100, height: 60, x: 560, y: ground.bottom + 125, color: 'black', draw: shapes.rect, fixed: true, physics: true
                });
                new Entity({
                    width: 500, height: 50, x: 1340, y: ground.bottom + 270, color: 'black', draw: shapes.rect, fixed: true, physics: true
                });
                new Entity({
                    width: 900, height: 50, x: 1800, y: ground.bottom + 390, color: 'black', draw: shapes.rect, fixed: true, physics: true
                });
                new Entity({
                    width: 500, height: 50, x: 2000, y: ground.bottom + 530, color: 'black', draw: shapes.rect, fixed: true, physics: true
                });
                new Entity({
                    width: 50, height: 1000, x: 2000, y: ground.bottom + 500, color: 'red', draw: shapes.rect, fixed: true, physics: true
                });
                for (let i in spis) {
                    spike = spis[i];
                    new Entity({
                        name:'enemy', width:5 * (spike[0] || 1), height:8 * (spike[0] || 1), x:spike[1] || 100, y:spike[3] || 0, color:spike[2] || 'grey', draw:shapes.triangle, fixed:spike[4] || false});
                }
            },
            eachFrame: function(elapsed) {
                if (runningLevel.goal && isOverlap(runningLevel.goal, player)) {
                    game.score = 100;
                    game.complete();
                    game.Continue('You Won!!!', 'green', `Completed in ${game.time / 1000} seconds!`, game);
                    setTouch(); //Disable touch controls
                }
                if (runningLevel.toggle && isOverlap(runningLevel.toggle, player) && playerGravity < 0) {
                    playerGravity = 40;
                    movementMult = 1;
                    for (let t of Entities) {
                        if (t.fixed) t.y = reflect(t.y, ground.bottom) - ground.height;
                        t.y -= 400;
                    }
                    Entities = Entities.filter(e => e !== runningLevel.toggle);
                    delete runningLevel.toggle;
                    runningLevel.goal = new Entity({
                        width: 300, height: 600, x: -2800, y: ground.top - 300, color: 'green', draw: shapes.rect, fixed: true
                    });
                    document.getElementById('riddle').innerHTML = 'Now go find the goal! Its back to the left.';
                     document.getElementById('riddle').style.fontSize = '30px';
                    document.getElementById('riddle').style.color = 'green';
                }
                if (runningLevel.toggle2 && isOverlap(runningLevel.toggle2, player) && movementMult === 1) {
                    Entities = Entities.filter(e => e !== runningLevel.toggle2);
                    delete runningLevel.toggle2;
                    movementMult = -1;
                    document.getElementById('riddle').innerHTML += '<br/>Oh no! Now you inverted your movement!';
                     document.getElementById('riddle').style.fontSize = '30px';
                }
            }
        }

    }
    /*****CLASSES*******/
    class Camera {
        constructor() {
            this.offsetX = 0;
            this.offsetY = 0;
            this.velY = 0;
            this.velX = 0;
        }
        update(elapsed) {
            this.offetX += this.velX * (elapsed / 1000);
            this.offsetY += this.velY * (elapsed / 1000);
        }
    }

    class Entity {
        constructor({name, width, height, x, y, color, draw, fixed, strokeColor, strokeWidth, physics}) { //"Static" is a reserved word, I replaced it with "fixed"; thanks
            if (name === 'enemy') {
                numSpikes++;
                spikes.push(this);
            };
            this.physics = physics || false;
            this.name = name;
            this.fixed = fixed || false;
            this.width = width || 50;
            this.height = height || 50;
            this.x = x || 0;
            this.y = y || 0;
            this.left = x - this.width / 2;
            this.top = y - this.height / 2;
            this.right = x + this.width / 2;
            this.bottom = y + this.height / 2;
            this.color = this.colour = color || 'grey';
            this.strokeColor = strokeColor || 'red';
            this.strokeWidth = strokeWidth || 5;
            this.drawCallback = draw || shapes.rect;
            this.vel = {
                x: 0,
                y: 0
            } //px per ms
            Entities.push(this);
        }
        setTop(pos) {
            this.y = pos + this.height / 2;
            this.top = pos;
            this.bottom = this.y + this.height / 2;
        }
        setLeft(pos) {
            this.x = pos + this.width / 2;
            this.left = pos;
            this.right = this.x + this.width / 2;
        }
        setBottom(pos) {
            this.y = pos - this.height / 2;
            this.bottom = pos;
            this.top = this.y - this.height / 2;
        }
        setRight(pos) {
            this.x = pos - this.width / 2;
            this.right = pos;
            this.left = this.x - this.width / 2;
        }
        setX(pos) {
            this.x = pos;
            this.left = this.x - this.width / 2;
            this.right = this.x + this.width / 2;
        }
        setY(pos) {
            this.y = pos;
            this.top = this.y - this.height / 2;
            this.bottom = this.y + this.height / 2;
        }
        draw(elapsed) {
            this.x += this.vel.x * (elapsed / 50); //Speed up, slow down
            this.y += this.vel.y * (elapsed / 50);
            if (this.name === 'player') {
                camera.offsetY = player.y;
                camera.offsetX = player.x;
            }
            this.left = this.x - this.width / 2;
            this.top = this.y - this.height / 2;
            this.right = this.x + this.width / 2;
            this.bottom = this.y + this.height / 2;
            let x = this.x + (canvas.width / 2) - (this.width / 2) - camera.offsetX;
            let y = this.y + (canvas.height / 2) - (this.height / 2) - camera.offsetY;
            let width = this.width;
            let height = this.height;
            ctx.fillStyle = this.color;
            ctx.strokeStyle = this.strokeColor;
            ctx.lineWidth = this.strokeWidth;
            this.drawCallback(x, y, width, height);
        }
    }

    /*******GLOBALS*********/
    let camera = new Camera();
    let prevFrame = 0;
    let player, ground
    let Entities = [];
    let spikes = [];
    let numSpikes = 0;
    let images = []
    let imageSrcs = ["/img/grass.jpg"]
    let enabledMoves = {
        'left': true,
        'right': true,
        'up': true,
        'down': true
    };
    for (let i = 0; i < imageSrcs; i++) {

    }
    runningLevel = Levels[LEVEL];
    Riddle.innerHTML = Levels[LEVEL].riddle;
    Levels[LEVEL].setup();

    function isOverlap(obj1, obj2) {
        return (obj1.left < obj2.right && obj1.right > obj2.left &&
            obj1.top < obj2.bottom && obj1.bottom > obj2.top);
    }
    /*******START OF GAME LOOP**********/
    let gameLoop = function(timestamp) {
        let elapsed = timestamp - prevFrame;
        prevFrame = timestamp;
        ctx.fillStyle = "rgb(108, 136, 221)";
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        //JUMPING
        if (KEYS.pressedKeys.has(' ') && enabledMoves.up) {
            game.moves++;
            if (onGround !== false) {
                if (playerGravity < 0)
                    player.vel.y = elapsed;
                else player.vel.y = -elapsed;
                onGround += elapsed;
            }
            if (onGround > 300) onGround = false;
        }

        //PLAYER MOVEMENT
        if ((KEYS.pressedKeys.has('a') || KEYS.pressedKeys.has('ArrowLeft')) && enabledMoves.left) {
            game.moves++;
            player.x -= movementMult * elapsed / 1.1;
        }
        if ((KEYS.pressedKeys.has('s') || KEYS.pressedKeys.has('ArrowDown')) && enabledMoves.down) {
            game.moves++;
            if (playerGravity < 0)
                player.y -= elapsed / 1.1
            else player.y += elapsed / 1.1;
        }
        if ((KEYS.pressedKeys.has('d') || KEYS.pressedKeys.has('ArrowRight')) && enabledMoves.right) {
            game.moves++;
            player.x += movementMult * elapsed / 1.1;
        }
        //Level Specific stuff
        Levels[LEVEL].eachFrame(elapsed);
        //SPIKES
        for (let i = 0; i < numSpikes; i++) {
            //alert(`${spikes[i].bottom} ${player.top}`)
            if (isOverlap(player, spikes[i])) {
                game.complete();
                game.Continue('You died!', 'red', "I guess it's over", game);
                setTouch(); //Disable touch controls
            }
        }
        //DRAW ENTIITIES
        for (t of Entities) {
            t.draw(elapsed);
            let collsion = false;
            if (t !== player && t.physics && isOverlap(player, t)) {
                collsion = true;
                // Determine direction of collision
                var dx = player.x - t.x;
                var dy = player.y - t.y;
                var combinedHalfWidths = (player.width + t.width) / 2;
                var combinedHalfHeights = (player.height + t.height) / 2;

                // Check collision direction based on player's center point
                if (Math.abs(dx) < combinedHalfWidths && Math.abs(dy) < combinedHalfHeights) {0
                    var overlapX = combinedHalfWidths - Math.abs(dx);
                    var overlapY = combinedHalfHeights - Math.abs(dy);

                    if (overlapX >= overlapY) {
                        if (dy > 0) {
                            if (player.vel.y < 0) player.vel.y = 0;
                            if (playerGravity < 0) onGround = 0;
                            if ((KEYS.pressedKeys.has('s') || KEYS.pressedKeys.has('ArrowDown')) && playerGravity < 0) player.setTop(t.bottom - 20);
                            else player.setTop(t.bottom);
                        } else {
                            if (player.vel.y > 0) player.vel.y = 0;
                            if (playerGravity > 0) onGround = 0;
                            if ((KEYS.pressedKeys.has('s') || KEYS.pressedKeys.has('ArrowDown')) && playerGravity > 0) player.setBottom(t.top + 20);
                            else player.setBottom(t.top);
                        }
                    } else {
                        if (dx > 0) {
                            player.setLeft(t.right);
                            if (player.vel.x < 0) player.vel.x = 0;
                        } else {
                            player.setRight(t.left);
                            if (player.vel.x > 0) player.vel.x = 0;
                        }
                    }
                }
            }
            if (t.fixed) continue;
            t.bottom = t.y + t.height / 2;
            ground.top = ground.y - ground.height / 2;
            if (t.bottom + 1 > ground.top && playerGravity > 0) {
        t.vel.y = 0;
        if (t === player) {
          onGround = 0;
          camera.velY = 0;
            if (KEYS.pressedKeys.has('s') || KEYS.pressedKeys.has('ArrowDown')) {
                t.setBottom(ground.top + 20);
                enabledMoves.down = false;
              }
            else 
                t.setBottom(ground.top - 1);
        } else 
            t.setBottom(ground.top - 1);
      } else if (t.top - 1 < ground.bottom && playerGravity < 0) {
          t.vel.y = 0;
        if (t === player) {
          onGround = 0;
          camera.velY = 0;
            if (KEYS.pressedKeys.has('s') || KEYS.pressedKeys.has('ArrowDown')) {
                t.setTop(ground.bottom - 20);
                enabledMoves.down = false;
              }
            else 
                t.setTop(ground.bottom + 1);
        } else 
            t.setTop(ground.bottom + 1);
      } else if (!collsion) {
                t.vel.y += playerGravity * (elapsed / 500);
                if (t === player) {
                    camera.velY += playerGravity * (elapsed / 500);
                }
            }
        }
        camera.update(elapsed);
        if (game.running) window.requestAnimationFrame(gameLoop);
    } //END OF GAME LOOP
    game.start();
    window.requestAnimationFrame(gameLoop);

    function handleKeyUp(e) {
        let code = e.keyCode || e.which || e.code || e.charCode;
        if (code === 13) {
            if (!game.running) location.reload();
        }
    }
    document.addEventListener('keyup', handleKeyUp);
    if (!touchInit) {
        initTouch();
    }
}
//ontouch bring up touch controls, onclick remove them.
function initTouch() { //Initiate touch controls
    //Handle touchstart
    document.getElementById('ctrl-left').addEventListener('touchstart', function(event) {
        if (FILE == 'games/enemy.js')
            KEYS.pressedKeys.add('a');
    });
    document.getElementById('ctrl-up').addEventListener('touchstart', function(event) {
        if (FILE == 'games/enemy.js')
            KEYS.pressedKeys.add(' ');
    });
    document.getElementById('ctrl-right').addEventListener('touchstart', function(event) {
        if (FILE == 'games/enemy.js')
            KEYS.pressedKeys.add('d');
    });
    document.getElementById('ctrl-down').addEventListener('touchstart', function(event) {
        if (FILE == 'games/enemy.js')
            KEYS.pressedKeys.add('s');
    });
    //Handle touchend.
    document.getElementById('ctrl-left').addEventListener('touchend', function(event) {
        if (FILE == 'games/enemy.js')
            KEYS.pressedKeys.delete('a');
    });
    document.getElementById('ctrl-up').addEventListener('touchend', function(event) {
        if (FILE == 'games/enemy.js')
            KEYS.pressedKeys.delete(' ');
    });
    document.getElementById('ctrl-right').addEventListener('touchend', function(event) {
        if (FILE == 'games/enemy.js')
            KEYS.pressedKeys.delete('d');
    });
    document.getElementById('ctrl-down').addEventListener('touchend', function(event) {
        if (FILE == 'games/enemy.js')
            KEYS.pressedKeys.delete('s');
    });
    //Open touch controls.
    window.addEventListener('touchstart', function(event) {
        if (FILE == 'games/enemy.js')
            setTouch(true);
        else
            setTouch();
    });
    window.addEventListener('touchend', function(event) {
        if (FILE != 'games/enemy.js')
            setTouch();
    });
    //Close touch controls.
    window.addEventListener('keydown', e => setTouch());
}

function setTouch(mode = false) {
    touchControls = mode;
    document.getElementById('controls').setAttribute('touch-enabled', `${mode}`);
}