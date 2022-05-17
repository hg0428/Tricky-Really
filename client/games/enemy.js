function startGame() {
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
  let groundImg = new Image()
  groundImg.src = '/img/grass.jpg';
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
    }
  }
  const Levels = {
    'vinde': {
      riddle:'You have to win this. Did you know that win is "vinde" in Danish? So, I guess get a V for vinde.',
      setup: function() {
        spikes[0] = new Entity('enemy', 50, 80, 200, 0, 'grey', shapes.triangle);
        spikes[1] = new Entity('enemy', 50, 80, 500, 0, 'grey', shapes.triangle);
        spikes[2] = new Entity('enemy', 50, 80, -400, 0, 'grey', shapes.triangle);
        spikes[3] = new Entity('enemy', 50, 80, -450, 0, 'grey', shapes.triangle);
        player = new Entity('player', 70, 70, 0, 0, 'green', shapes.rect);
        ground = new Entity('ground', 6000, 200, 100, canvas.height / 2 - 100, 'green', shapes.groundImage, true);
      },
      eachFrame: function(elapsed) {
        if (KEYS.pressedKeys.has('v') && LEVEL === 'vinde') {
          game.score = 100;
          game.complete();
          game.Continue('You Won!!!', 'green', `Completed in ${game.time / 1000} seconds!`, game);
        }
      }
    }
  }
  /*
  console.error = function(...args) {
    document.write(args.join(' '));
  }
  */
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
    constructor(name, width, height, x, y, color, draw, fixed) { //"Static" is a reserved word, I replaced it with "fixed"; thanks
      if (name === 'enemy') {
        numSpikes++;
        spikes.push(this);
      };
      this.name = name;
      this.fixed = fixed || false;
      this.width = width;
      this.height = height;
      this.x = x;
      this.y = y;
      this.left = x - this.width / 2;
      this.top = y - this.height / 2;
      this.right = x + this.width / 2;
      this.bottom = y + this.height / 2;
      this.color = this.colour = color;
      this.drawCallback = draw;
      this.vel = {
        x: 0,
        y: 0
      }//px per ms
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
      this.drawCallback(x, y, width, height);
    }
  }
  
  /*******GLOBALS*********/
  let camera = new Camera();
  let prevFrame = 0;
  let player, ground
  let playerGravity = 25;
  let onGround = 0;
  let Entities = [];
  let spikes = [];
  let numSpikes = 0;
  let images = []
  let imageSrcs = ["/img/grass.jpg"]
  
  for (let i = 0; i < imageSrcs; i++) {
  
  }
  Riddle.innerHTML = Levels[LEVEL].riddle;
  Levels[LEVEL].setup();
  
  
  
  function rectRectCollide(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x1 + w1 > x2 && x1 < x2 + w2 && y1 + h1 > y2 && y1 < y2 + h2;
  }
  
  /*******START OF GAME LOOP**********/
  let gameLoop = function(timestamp) {
    let elapsed = timestamp - prevFrame;
    prevFrame = timestamp;
    ctx.fillStyle = "lightblue";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  
    //JUMPING
    if (KEYS.pressedKeys.has(' ')) {
      game.moves++;
      if (onGround !== false) {
        player.vel.y = -elapsed;
        onGround += elapsed;
      }
      if (onGround > 288) onGround = false;
    }
  
    //PLAYER MOVEMENT
    if (KEYS.pressedKeys.has('a') || KEYS.pressedKeys.has('ArrowLeft')) {
      game.moves++;
      player.x -= elapsed;
    } if (KEYS.pressedKeys.has('s') || KEYS.pressedKeys.has('ArrowDown')) {
      game.moves++;
      player.y += elapsed;
    } if (KEYS.pressedKeys.has('d') || KEYS.pressedKeys.has('ArrowRight')) {
      game.moves++;
      player.x += elapsed;
    }
    //Level Specific stuff
    Levels[LEVEL].eachFrame(elapsed);
    //SPIKES
    for (let i = 0; i < numSpikes; i++) {
      if (rectRectCollide(player.x, player.y, player.width / 1.5, player.height, spikes[i].x, spikes[i].y, spikes[i].width, spikes[i].height)) {
        game.complete();
        game.Continue('You died!', 'red', "I guess it's over", game);
      }
    }
    //DRAW ENTIITIES
    for (t of Entities) {
      t.draw(elapsed);
      if (t.fixed) continue;
      t.bottom = t.y + t.height / 2;
      ground.top = ground.y - ground.height / 2;
      if (t.bottom + 1 > ground.top) {
        t.vel.y = 0;
        if (t === player) {
          onGround = 0;
          camera.velY = 0;
        }
        t.setBottom(ground.top - 1);
      } else {
        t.vel.y += playerGravity * (elapsed / 500); // I guess 1 pixel = 1 meter?
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
}
startGame()