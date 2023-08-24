//move to game engine.
let touchInit = false;
var touchControls = false;
var playerGravity = 40;
var useVelMove = false;
var airResistance = 0.978;
var onGround = 0;
var movementMult = 0.98;
let groundImg = new Image();
let runningLevel;
var resetTimestamp = false;
var Entities = [];
var spikes = [];
var limit = 5000;
var player, ground, camera;
var prevFrame = 0;
var playerJumpLimit = 300;
var controls = true;
var currentgame = 0;
groundImg.src = '/img/grass.jpg';
GAMES['games/enemy.js'] = function(LEVEL) {
  /* ******SETUP******* */
  player = null;
  ground = null;
  let game = new Game('games/enemy.js', LEVEL);
  game.set('<h3 id="riddle"></h3>');
  game.loadCSS('/css/game.css');
  let Riddle = document.getElementById('riddle');
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  movementMult = 1;
  playerGravity = 40;
  onGround = 0;
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
      ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, 2 * Math.PI);
      ctx.fill()
    }
  } // loadLevel("games/enemy.js", "getthere")
  const Levels = {
    'vinde': {
      riddle: 'You have to win this. Did you know that win is "vinde" in Danish? So, I guess get a V for vinde.',
      setup: function() {
        player = new Entity({ name: 'player', width: 70, height: 70, x: -2200, y: 0, color: 'green', draw: shapes.rect, physics: true });
        new Entity({ name: 'enemy', width: 50, height: 80, x: 200, y: 0, color: 'grey', draw: shapes.triangle, physics: true });
        new Entity({ name: 'enemy', width: 50, height: 80, x: 500, y: 0, color: 'grey', draw: shapes.triangle, physics: true });
        new Entity({ name: 'enemy', width: 50, height: 80, x: -400, y: 0, color: 'grey', draw: shapes.triangle, physics: true });
        new Entity({ name: 'enemy', width: 50, height: 80, x: -450, y: 0, color: 'grey', draw: shapes.triangle, physics: true });
        ground = new Entity({ name: 'ground', width: 6000, height: 200, x: 100, y: canvas.height / 2 - 100, color: 'green', draw: shapes.groundImage, fixed: true, physics: true });
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
      },
      cleanUp: function() {
        document.getElementById('ctrl-V').remove();
      }
    },
    'get-there': {
      riddle: 'Find the goal.', //Ran out of ideas....
      setup: function() {
        player = new Entity({ name: 'player', width: 70, height: 70, x: -2200, y: 0, color: 'green', draw: shapes.rect, physics: true });
        ground = new Entity({ name: 'ground', width: 6000, height: 200, x: 100, y: 350, color: 'green', draw: shapes.groundImage, fixed: true, physics: true });
        let goal = runningLevel.goal = new Entity({ name: 'goal', width: 10, height: 300, x: 500, y: ground.top - 1000, color: 'rgba(0, 255, 40, 0.8)', draw: shapes.rect });
        let spis = [
          [3, -2000, 'red'],
          [6, -1800, 'red'],
          [7, -1200, 'red'],
          [8, -2400, 'red'],
          [5, -2600, 'red'],
          [22, -300, 'red', 100, true]
        ]
        for (let i in spis) {
          spike = spis[i];
          new Entity({
            name: 'enemy', width: 5 * (spike[0] || 1), height: 8 * (spike[0] || 1), x: spike[1] || 100, y: spike[3] || 0, color: spike[2] || 'grey', draw: shapes.triangle, fixed: spike[4] || false, physics: true
          });
        }
      },
      eachFrame: function(elapsed) {
        if (player.x > runningLevel.goal.x + runningLevel.goal.width) {
          game.score = 100;
          game.complete();
          game.Continue('You Won!!!', 'green', `Completed in ${game.time / 1000} seconds!`, game);
          setTouch(); //Disable touch controls
        }
      },
      cleanUp: function() {

      }
    },
    'upsidedown': {
      riddle: 'Oh no! The world is upside down and you need to fix it!',
      setup: function() {
        playerGravity = -40;
        player = new Entity({ name: 'player', width: 70, height: 70, x: -2200, y: 0, color: 'green', draw: shapes.rect, physics: true });
        ground = new Entity({ name: 'ground', width: 10000, height: 200, x: 100, y: 350, color: 'darkgreen', draw: shapes.groundImage, fixed: true, physics: true });
        runningLevel.toggle = new Entity({ name: 'toggle', width: 50, height: 50, x: 2800, y: ground.top - 75, color: 'rgba(0, 255, 40, 0.8)', draw: shapes.ellipse, fixed: true });
        runningLevel.toggle2 = new Entity({ name: 'toggle2', width: 50, height: 50, x: 100, y: ground.top - 75, color: 'rgba(255, 40, 0, 0.8)', draw: shapes.ellipse, fixed: true });
        let spis = [
          [5, -2100, 'red'],
          [6, -1800, 'red'],
          [9, -1200, 'red'],
        ]
        new Entity({
          width: 500, height: 50, x: 400, y: ground.top - 70, color: 'black', draw: shapes.rect, fixed: true, physics: true
        });
        new Entity({
          width: 200, height: 50, x: 400, y: ground.top - 25, color: 'black', draw: shapes.rect, fixed: true, physics: true
        });
        runningLevel.hint = new Entity({
          width: 100,
          height: 50,
          x: 900,
          y: ground.top - 75,
          color: 'yellow',
          draw: shapes.circle,
          fixed: true
        })
        new Entity({
          width: 500, height: 50, x: 850, y: ground.top - 170, color: 'black', draw: shapes.rect, fixed: true, physics: true
        });
        new Entity({
          width: 100, height: 60, x: 560, y: ground.top - 125, color: 'black', draw: shapes.rect, fixed: true, physics: true
        });
        new Entity({
          width: 500, height: 50, x: 1340, y: ground.top - 270, color: 'black', draw: shapes.rect, fixed: true, physics: true
        });
        new Entity({
          width: 900, height: 50, x: 1800, y: ground.top - 390, color: 'black', draw: shapes.rect, fixed: true, physics: true
        });
        new Entity({
          width: 500, height: 50, x: 2000, y: ground.top - 530, color: 'black', draw: shapes.rect, fixed: true, physics: true
        });
        new Entity({
          width: 50, height: 1000, x: 2000, y: ground.top - 500, color: 'red', draw: shapes.rect, fixed: true, physics: true
        });
        for (let i in spis) {
          spike = spis[i];
          new Entity({
            name: 'enemy', width: 5 * (spike[0] || 1), height: 8 * (spike[0] || 1), x: spike[1] || 100, y: spike[3] || 0, color: spike[2] || 'grey', draw: shapes.triangle, fixed: spike[4] || false
          });
        }
        for (let t of Entities) {
          t.y = reflect(t.y, ground.bottom) + ground.height + 400;
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
            t.y = reflect(t.y, ground.bottom) - ground.height - 400;
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
        if (runningLevel.hint && isOverlap(runningLevel.hint, player)) {
          Entities = Entities.filter(e => e !== runningLevel.hint);
          delete runningLevel.hint;
          alert('Try changing tabs and coming back.');
        }
      },
      cleanUp: function() {

      }
    }, "up-down-all-around": {
      riddle: 'Going down!',
      setup: function() {
        playerGravity = 30;
        player = new Entity({ name: 'player', width: 70, height: 70, x: 0, y: 250, color: 'green', draw: shapes.rect, physics: true });
        runningLevel.hint1Given = false;
        let bottom = new Entity({ name: 'ground', width: 1000, height: 65, x: 0, y: 500, color: 'black', draw: shapes.rect, fixed: true, physics: true }).setLeft(-100);
        runningLevel.faithTrigger = new Entity({ width: player.width * 1.5, height: 10, fixed: true, physics: false, color: 'transparent' }).setRight(bottom.right).setBottom(bottom.top);
        new Entity({ name: 'ground', width: 1000, height: 65, x: 0, y: 0, color: 'black', draw: shapes.rect, fixed: true, physics: true }).setLeft(-100);
        new Entity({ width: 65, height: 350, x: 0, y: 200, color: 'black', draw: shapes.rect, fixed: true, physics: true }).setLeft(200).setBottom(bottom.top);
        new Entity({ width: 65, height: 500, x: 0, y: 200, color: 'black', draw: shapes.rect, fixed: true, physics: true }).setLeft(-100).setBottom(bottom.top);
        let lowBottom = new Entity({ width: 700, height: 150, color: 'darkgreen', draw: shapes.rect, fixed: true, physics: true, y: 2000 }).setLeft(bottom.right);
        new Entity({ width: 30, height: 1000, color: 'red', fixed: true, physics: true }).setLeft(lowBottom.left).setTop(lowBottom.bottom + 100);
        let rightRedBlocker = new Entity({ width: 30, height: 1000, color: 'red', fixed: true, physics: true }).setRight(lowBottom.right).setTop(lowBottom.bottom + 100);
        new Entity({ width: 700, height: 55, color: 'darkgreen', draw: shapes.rect, fixed: true, physics: true }).setBottom(rightRedBlocker.bottom).setRight(rightRedBlocker.right);
        runningLevel.blueblock = new Entity({ width: 40, height: 40, color: 'lightblue', y: rightRedBlocker.top + 300, fixed: true, physics: false }).setRight(rightRedBlocker.left);
        let topofentry = new Entity({ width: 75, height: 400, color: 'black', fixed: true, physics: true }).setLeft(rightRedBlocker.right + 200).setTop(lowBottom.top - 200);
        new Entity({ width: 75, height: 400, color: 'black', fixed: true, physics: true }).setLeft(rightRedBlocker.right + 200).setTop(topofentry.bottom + 60);
        let topbarrier = new Entity({ width: 500, height: 75, color: 'black', fixed: true, physics: true }).setTop(topofentry.top).setLeft(topofentry.right);
        new Entity({ width: 500, height: 75, color: 'black', fixed: true, physics: true }).setBottom(topofentry.bottom + 460).setLeft(topofentry.right);
        let rightbarrier = new Entity({ height: 860, width: 75, color: 'black', fixed: true, physics: true }).setLeft(topbarrier.right).setTop(topbarrier.top);
        runningLevel.goal = new Entity({ y: rightbarrier.y, x: topbarrier.x, width: 80, height: 80, color: 'gold', draw: shapes.ellipse, fixed: true, physics: false });
        document.getElementById('controls').innerHTML += '<div class="controlbtn" id="ctrl-G">G</div>';
        window.onblur = function() {

        };
        window.onfocus = function() {
          resetTimestamp = true;
          //window.requestAnimationFrame(gameLoop);
        }
        document.getElementById('ctrl-G').onclick = function() {
          if (playerGravity > 0) {
            playerGravity = -30;
            document.getElementById('riddle').innerHTML = 'Going Up!';
          }
          else {
            playerGravity = 30;
            document.getElementById('riddle').innerHTML = 'Going Down!';
          }
        }
        runningLevel.keyupListener = function(e) {
          if (e.key.toLowerCase() === 'g') {
            if (playerGravity > 0) {
              playerGravity = -30;
              document.getElementById('riddle').innerHTML = 'Going Up!';
            }
            else if (playerGravity < 0) {
              playerGravity = 30;
              document.getElementById('riddle').innerHTML = 'Going Down!';
            }
          }
        };
        document.addEventListener('keyup', runningLevel.keyupListener);
      },
      eachFrame: function(elapsed) {
        if (!runningLevel.hint1Given && isOverlap(runningLevel.faithTrigger, player)) {
          KEYS.pressedKeys = new Set();
          alert('Sometimes you just need to take a leap of faith.');
          runningLevel.hint1Given = true;
        }
        if (runningLevel.blueblock && isOverlap(runningLevel.blueblock, player)) {
          playerGravity = 0;
          useVelMove = true;
          document.getElementById('riddle').innerText = 'Gravity has been disabled';
          Entities = Entities.filter(e => e !== runningLevel.blueblock);
          delete runningLevel.blueblock;
        }
        if (isOverlap(runningLevel.goal, player)) {
          game.score = 100;
          game.complete();
          game.Continue('You Won!!!', 'green', `Completed in ${game.time / 1000} seconds!`, game);
          setTouch(); //Disable touch controls
        }
      },
      cleanUp: function() {
        document.getElementById('ctrl-G').remove();
        document.removeEventListener('keyup', runningLevel.keyupListener);
      }
    },
    "Obstacle Course": {
      riddle: "Sinking Sand",
      setup: function() {
        playerGravity = 40;
        limit = 5000;
        game.running = true;
        controls = false;
        window.requestAnimationFrame(gameLoop);
        runningLevel.goal = new Entity({ color: 'gold', draw: shapes.ellipse, width: 150, height: 150, fixed: true, physics: false, x: 1700, y: 1000 });
        player = new Entity({ name: 'player', width: 70, height: 70, x: 0, y: 0, color: 'green', draw: shapes.rect, physics: true });
        camera.offsetX = runningLevel.goal.x;
        camera.offsetY = runningLevel.goal.y;
        camera.to(player.x, player.y, 3000, function() {
          controls = true;
          game.start();
        });
        new Entity({ color: 'black', width: 40, height: 4500, y: 1650, fixed: true, physics: true, x: 700 });
        new Entity({ color: "black", width: 150, height: 45, draw: shapes.ellipse, y: 150, fixed: true, physics: true });
        new Entity({ color: "blue", width: 200, height: 44, fixed: true, x: 250, y: 150 })
        new Entity({ color: "yellow", width: 200, height: 37, fixed: true, physics: true, x: -250, y: 27 })
        let blue = new Entity({ color: "blue", width: 150, height: 32, fixed: true, physics: true, x: -515, y: -105 });
        new Entity({ color: "green", width: 300, height: 40, fixed: true, physics: false, x: 0, y: -255 });
        let topstair = createStairs(blue.top + 8, blue.left, 1600, 1800, { physics: true, fixed: true, numSteps: 80, reverse: true, horizontalDirection: 'left', verticalDirection: 'down' });
        let faller = new Entity({ color: 'black', width: 595, height: topstair.height, physics: false, y: topstair.y, fixed: true }).setRight(topstair.left);
        let end = new Entity({ color: 'black', width: 2000, height: topstair.height, physics: true, y: topstair.y, fixed: true }).setRight(faller.left);
        let platform = new Entity({ color: 'black', width: 150, height: topstair.height, physics: true, y: topstair.y - 100, fixed: true }).setLeft(end.left + 200);
        let hightopstair = createStairs(platform.top + 8, platform.right, 1800, 2290, { physics: true, fixed: true, numSteps: 105, reverse: true, horizontalDirection: 'right', verticalDirection: 'down' });
        let plats = [];
        plats.push(new Entity({color:'black', width:180, height:hightopstair.height, fixed:true, physics:true}).setLeft(hightopstair.right).setTop(hightopstair.top));
        plats.push(new Entity({color:'black', width:300, height:hightopstair.height, fixed:true, physics:false}).setLeft(plats[0].right).setTop(plats[0].top));
        plats.push(new Entity({color:'black', width:300, height:hightopstair.height, fixed:true, physics:true}).setLeft(plats[1].right).setTop(plats[1].top));
        plats.push(createStairs(plats[2].top + 8, plats[2].right, runningLevel.goal.left-plats[2].right, runningLevel.goal.y-200-plats[2].top, { physics: true, fixed: true, numSteps: 100, reverse: true, horizontalDirection: 'right', verticalDirection: 'up' }));
        //createStairs() //from the ^^ to a maze thing or something
      },
      eachFrame: function(elapsed) {
        if (isOverlap(runningLevel.goal, player)) {
          game.score = 100;
          game.complete();
          game.Continue('You Won!!!', 'green', `Completed in ${game.time / 1000} seconds!`, game);
          setTouch(); //Disable touch controls
        }
      },
      cleanUp: function() {

      }
    }
  }
  /*
  IDEAS:
  Ability to change your size.
  Levels where you have to navigate by turning gravity to positive, off, or negative.
  Moving obstacles or enemies.
  */
  /** ***CLASSES****** */
  function createStairs(bottom, left, width, height, options) {
    const {
      numSteps = 5,
      stepWidth = width / numSteps,
      stepHeight = height / numSteps,
      color = 'black',
      strokeColor = 'red',
      strokeWidth = 0,
      physics = false,
      fixed = false,
      horizontalDirection = 'right',
      verticalDirection = 'up',
    } = options || {};

    const horizontalSign = horizontalDirection === 'left' ? -1 : 1;
    const verticalSign = verticalDirection === 'up' ? -1 : 1;
    let latest;
    for (let i = 0; i < numSteps; i++) {
      const x = left + i * stepWidth * horizontalSign;
      const y = bottom - (i + 1) * stepHeight * verticalSign;

      latest = new Entity({
        name: 'step',
        width: stepWidth,
        height: stepHeight,
        x,
        y,
        color,
        strokeColor,
        strokeWidth,
        physics,
        fixed,
      });
    }
    return latest
  }




  class Camera {
    constructor() {
      this.offsetX = 0;
      this.offsetY = 0;
      this.velY = 0;
      this.velX = 0;
      this.goal = null;
      this.tracked = null;
    }
    update(elapsed) {
      //document.getElementById('riddle').innerText = `${this.velX}, ${this.offsetX}, ${goal[0]} && ${this.velY}, ${this.offsetY}, ${goal[1]}`;
      this.offsetX += this.velX * (elapsed / 1000);
      this.offsetY += this.velY * (elapsed / 1000);
      if (this.goal) {
        if ((this.velX < 0 && this.offsetX < this.goal[0]) || (this.velX > 0 && this.offsetX > this.goal[0])) this.offsetX = this.goal[0];
        if ((this.velY < 0 && this.offsetY < this.goal[1]) || (this.velY > 0 && this.offsetY > this.goal[1])) this.offsetY = this.goal[1];
        if (this.offsetX === this.goal[0] && this.offsetY === this.goal[1]) {
          this.goal[2]();
          this.goal = null;
          this.velX = this.velY = 0;
        }
      }
      else if (this.tracked) {
        this.velX = this.tracked.vel.x;
        this.velY = this.tracked.vel.y;
        this.offsetX = this.tracked.x;
        this.offsetY = this.tracked.y;
      }
    }
    to(x, y, ms, funct) {
      console.log('to')
      this.velX = (x - this.offsetX) / ms * 1000;
      this.velY = (y - this.offsetY) / ms * 1000;
      this.goal = [x, y, funct]
    }
    track(entity) {
      this.tracked = entity;
    }
  }
  function numberDistance(a, b) {
    return a > b ? a - b : b - a
  };
  class Entity {
    constructor({ name, width, height, x, y, color, draw, fixed, strokeColor, strokeWidth, physics }) { //"Static" is a reserved word, I replaced it with "fixed"; thanks
      if (name === 'enemy') {
        numSpikes++;
        spikes.push(this);
      };
      this.game = currentgame;
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
      return this;
    }
    setLeft(pos) {
      this.x = pos + this.width / 2;
      this.left = pos;
      this.right = this.x + this.width / 2;
      return this;
    }
    setBottom(pos) {
      this.y = pos - this.height / 2;
      this.bottom = pos;
      this.top = this.y - this.height / 2;
      return this;
    }
    setRight(pos) {
      this.x = pos - this.width / 2;
      this.right = pos;
      this.left = this.x - this.width / 2;
      return this;
    }
    setX(pos) {
      this.x = pos;
      this.left = this.x - this.width / 2;
      this.right = this.x + this.width / 2;
      return this;
    }
    setY(pos) {
      this.y = pos;
      this.top = this.y - this.height / 2;
      this.bottom = this.y + this.height / 2;
      return this;
    }
    update(elapsed) {
      if (this.game !== currentgame) return;
      this.x += this.vel.x * (elapsed / 50); // Speed up, slow down
      this.y += this.vel.y * (elapsed / 50);
      this.vel.x *= airResistance;
      this.vel.y *= airResistance;
      this.left = this.x - this.width / 2;
      this.top = this.y - this.height / 2;
      this.right = this.x + this.width / 2;
      this.bottom = this.y + this.height / 2;
    }
    draw() {
      if (this.game !== currentgame) return;
      let x = this.x + (canvas.width / 2) - (this.width / 2) - camera.offsetX;
      let y = this.y + (canvas.height / 2) - (this.height / 2) - camera.offsetY;
      ctx.fillStyle = this.color;
      ctx.strokeStyle = this.strokeColor;
      ctx.lineWidth = this.strokeWidth;
      this.drawCallback(x, y, this.width, this.height);
    }
  }
  /* ******GLOBALS******** */
  let camera = new Camera();
  
  Entities.splice(0, Entities.length);
  Entities.length = 0;
  spikes.splice(0, spikes.length);
  spikes.length = 0;
  let numSpikes = 0;
  let images = [];
  let imageSrcs = ["/img/grass.jpg"]
  let enabledMoves = {
    'left': true,
    'right': true,
    'up': true,
    'down': true
  };
  for (let i = 0; i < imageSrcs; i++) {
    //TODO: load images
  }
  function isOverlap(obj1, obj2) {
    return (obj1.left < obj2.right && obj1.right > obj2.left &&
      obj1.top < obj2.bottom && obj1.bottom > obj2.top);
  }
  /*******START OF GAME LOOP**********/
  let gameLoop = function(timestamp) {
    if (resetTimestamp === true || prevFrame === 0) {
      prevFrame = timestamp - 1;
      resetTimestamp = false;
    }
    let elapsed = timestamp - prevFrame;
    // if (elapsed > 30) {
    //     console.log('elapsed', elapsed);
    // }
    prevFrame = timestamp;
    ctx.fillStyle = "rgb(108, 136, 221)";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (player) {
      //JUMPING
      if (KEYS.pressedKeys.has(' ') && enabledMoves.up) {
        game.moves++;
        if (onGround !== false || playerGravity === 0) {
          if (playerGravity < 0)
            player.vel.y = elapsed;
          else player.vel.y = -elapsed;
          onGround += elapsed;
        }
        if (onGround > playerJumpLimit) onGround = false;
      }

      //PLAYER MOVEMENT
      if ((KEYS.pressedKeys.has('a') || KEYS.pressedKeys.has('A') || KEYS.pressedKeys.has('ArrowLeft')) && enabledMoves.left) {
        game.moves++;
        if (useVelMove) player.vel.x = -elapsed
        else player.x -= movementMult * elapsed / 1.1;
      }
      if ((KEYS.pressedKeys.has('s') || KEYS.pressedKeys.has('S') || KEYS.pressedKeys.has('ArrowDown')) && enabledMoves.down) {
        game.moves++;
        if (playerGravity < 0) {
          if (useVelMove) player.vel.y = -elapsed;
          else player.y -= elapsed / 1.1;
        }
        else {
          if (useVelMove) player.vel.y = elapsed;
          player.y += elapsed / 1.1;
        }
      }
      if ((KEYS.pressedKeys.has('d') || KEYS.pressedKeys.has('D') || KEYS.pressedKeys.has('ArrowRight')) && enabledMoves.right) {
        game.moves++;
        if (useVelMove) player.vel.x = elapsed
        else player.x += movementMult * elapsed / 1.1;
      }
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
    //UPDATE ENTIITIES
    for (let t of Entities) {
      if (t.game !== currentgame) continue;
      t.collision = {
        top: false,
        bottom: false,
        left: false,
        right: false
      };
      if (t.physics) {
        for (let obj of Entities) {
          if (t !== obj && obj.physics && isOverlap(obj, t)) {
            // Determine direction of collision
            var dx = obj.x - t.x;
            var dy = obj.y - t.y;
            var combinedHalfWidths = (obj.width + t.width) / 2;
            var combinedHalfHeights = (obj.height + t.height) / 2;

            // Check collision direction based on obj's center point
            if (Math.abs(dx) < combinedHalfWidths && Math.abs(dy) < combinedHalfHeights) {
              var overlapX = combinedHalfWidths - Math.abs(dx);
              var overlapY = combinedHalfHeights - Math.abs(dy);

              if (overlapX >= overlapY) {
                if (dy > 0) {
                  t.collision.bottom = true;
                  if (!obj.fixed) {
                    if (obj.vel.y < 0) obj.vel.y = 0;
                    if (obj === player && playerGravity < 0) onGround = 0;
                    if (obj === player && (KEYS.pressedKeys.has('s') || KEYS.pressedKeys.has('ArrowDown'))) obj.setTop(t.bottom - 20);
                    else obj.setTop(t.bottom - 0.01);
                  }
                } else {
                  t.collision.top = true;
                  if (!obj.fixed) {
                    if (obj.vel.y > 0) obj.vel.y = 0;
                    if (obj === player && playerGravity > 0) onGround = 0;
                    if (obj === player && (KEYS.pressedKeys.has('s') || KEYS.pressedKeys.has('ArrowDown')) && playerGravity > 0) obj.setBottom(t.top + 20);
                    else obj.setBottom(t.top + 0.01);
                  }
                }
              } else if (dx > 0) {
                t.collision.right = true;
                if (!obj.fixed) {
                  obj.setLeft(t.right - 0.01);
                  if (obj.vel.x < 0) obj.vel.x = 0;
                }
              } else {
                t.collision.left = true;
                if (!obj.fixed) {
                  obj.setRight(t.left + 0.01);
                  if (obj.vel.x > 0) obj.vel.x = 0;
                }
              }
              //if (t === player) console.log(obj.name, t.name, t.collision);
            }
          }
        }
      }
      t.update(elapsed);
      if (t.fixed) continue;
      //if (t === player) console.log(t.collision);
      if ((playerGravity > 0 && !t.collision.bottom) || (playerGravity < 0 && !t.collision.top)) {

        t.vel.y += playerGravity * (elapsed / 400);
        if (t === player) {
          camera.velY += playerGravity * (elapsed / 400);
        }
      } else {
        t.vel.y = 0;
      }
    }
    if (player && (player.y > limit || player.y < -limit)) {
      game.score = 0;
      game.complete();
      game.Continue('You Fell!', 'orange', `Completed in ${game.time / 1000} seconds!`, game);
      setTouch(); //Disable touch controls
    }
    camera.update(elapsed);
    for (let t of Entities) {
      t.draw();
    }
    if (game.running) window.requestAnimationFrame(gameLoop);
  } //END OF GAME LOOP
  Entities.splice(0, Entities.length);
  Entities.length = 0;
  spikes.splice(0, spikes.length);
  spikes.length = 0;
  console.log(Entities, player, ground);
  useVelMove = false;
  runningLevel = Levels[LEVEL];
  currentgame++;
  Riddle.innerHTML = Levels[LEVEL].riddle;
  Levels[LEVEL].setup();
  if (player) camera.track(player);
  //console.log(player.x, player.y);
  game.onend = Levels[LEVEL].cleanUp;
  if (!game.running) {
    console.log('starting');
    game.running = true;
    game.start();
    window.requestAnimationFrame(gameLoop);
    if (player) camera.track(player);
  }
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