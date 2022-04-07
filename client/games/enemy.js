document.body.innerHTML='<h3>You have to win this. Did you know that win is "vinde" in Danish? So, I guess get a V for vinde.</h3>';
let head = document.getElementsByTagName('head')[0];
let style = document.createElement('link');
style.href = "/css/game.css";
style.type = 'text/css';
style.rel = 'stylesheet';
head.append(style);
let game = new Game();
console.error = function(...args) {
  document.write(args.join(' '));
}
const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
const ctx = canvas.getContext("2d");
canvas.height = document.body.offsetHeight;
canvas.width = document.body.offsetWidth;
class Camera {
    constructor() {
        this.offsetX = 0;
        this.offsetY = 0;
        this.velY = 0;
        this.velX=0;
    }
    update(elapsed) {
      this.offetX += this.velX*(elapsed/1000);
      this.offsetY += this.velY*(elapsed/1000);
    }
}
let Things = [];
class Thing {
  constructor(name, width, height, x, y, color, draw) {
    this.name = name;
    this.width=width;
    this.height=height;
    this.x = x;
    this.y = y;
    this.left = x - this.width/2;
    this.top = y - this.height/2;
    this.right = x + this.width/2;
    this.bottom = y + this.height/2;
    this.color = this.colour = color;
    this.drawCallback=draw;
    this.vel = {
      x:0,
      y:0
    }//px per ms
    Things.push(this);
  }
  setTop(pos) {
    this.y = pos + this.height/2;
    this.top = pos;
    this.bottom = this.y + this.height/2;
  }
  setLeft(pos) {
    this.x = pos + this.width/2;
    this.left = pos;
    this.right = this.x + this.width/2;
  }
  setBottom(pos) {
    this.y = pos - this.height/2;
    this.bottom = pos;
    this.top = this.y - this.height/2;
  }
  setRight(pos) {
    this.x = pos - this.width/2;
    this.right = pos;
    this.left = this.x - this.width/2;
  }
  setX(pos) {
    this.x = pos;
    this.left = this.x - this.width/2;
    this.right = this.x + this.width/2;
  }
  setY(pos) {
    this.y = pos;
    this.top = this.y - this.height/2;
    this.bottom = this.y + this.height/2;
  }
  draw(elapsed) {
    this.x += this.vel.x*(elapsed/100);
    this.y += this.vel.y*(elapsed/100);
    if (this.name === 'player') {
      camera.offsetY = player.y;
      camera.offsetX = player.x;
    }
    this.left = this.x - this.width/2;
    this.top = this.y - this.height/2;
    this.right = this.x + this.width/2;
    this.bottom = this.y + this.height/2;
    let x = this.x+(canvas.width/2)-(this.width/2)  - camera.offsetX;
    let y = this.y+(canvas.height/2)-(this.height/2)  - camera.offsetY;
    let width = this.width;
    let height = this.height;
    ctx.fillStyle = this.color;
    this.drawCallback(x, y, width, height);
  }
}
let camera = new Camera();
let prevFrame = 0;
let rect, player, ground, enemy;
let onGround = 0;
let gameLoop = function(timestamp) {
  let elapsed = timestamp-prevFrame;
  prevFrame = timestamp;
  ctx.fillStyle = "lightblue";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  console.log(enemy.x, enemy.y, player.x, player.y);
  if (KEYS.pressedKeys.has(' ')) {
    game.moves++;
    if (onGround!==false) {
      player.vel.y = -elapsed;
      onGround += elapsed;
    }
    if (onGround > 288) onGround = false;
  } if (KEYS.pressedKeys.has('a') || KEYS.pressedKeys.has('ArrowLeft')) {
    game.moves++;
    player.x -= elapsed;
  } if (KEYS.pressedKeys.has('s') || KEYS.pressedKeys.has('ArrowDown')) {
    game.moves++;
    player.y += elapsed;
  } if (KEYS.pressedKeys.has('d') || KEYS.pressedKeys.has('ArrowRight')) {
    game.moves++;
    player.x += elapsed;
  } if (KEYS.pressedKeys.has('v') && LEVEL === 'vinde') {
    game.complete();
    game.socket.emit('complete', 100, game.time, game.moves);
    document.body.innerHTML = `<div class="center" style="color:green"><center><h1>You WON!!!</h1><h2>Completed in ${game.time/1000} seconds!</h2></center><br/><center><button class="extraLarge" onclick="location.reload();">Continue</button></center></div>`;
  }
  if (player.left > enemy.left && player.left < enemy.right && player.top > enemy.top && player.top < enemy.bottom) {
    game.complete();
    game.socket.emit('complete', 0, game.time, game.moves);
    document.body.innerHTML = `<div class="center" style="color:red"><center><h1>You died!</h1><h2>I guess its over</h2></center><br/><center><button class="extraLarge" onclick="location.reload();">Continue</button></center></div>`;
  }
  for (t of Things) {
    t.draw(elapsed);
    if (t.name == 'ground') continue;
    t.bottom = t.y + t.height / 2;
    ground.top = ground.y-ground.height/2;
    if (t.bottom + 1 > ground.top) {
      t.vel.y = 0;
      if (t === player) {
        onGround = 0;
        camera.velY = 0;
      }
      t.setBottom(ground.top - 1);
    } else {
      t.vel.y += 9.8 * (elapsed / 500); // I guess 1 pixel = 1 meter?
      if (t === player) {
        camera.velY += 9.8 * (elapsed / 500);
      }
    }
  }
  camera.update(elapsed);
  window.requestAnimationFrame(gameLoop);
}
let img = new Image();
img.src = '/img/grass.jpeg';
img.onload = function() {
  rect = (x, y, w, h) => ctx.fillRect(x, y, w, h);
  let image = (x, y, w, h) => ctx.drawImage(img, x, y, w, h);
  let triangle = (x, y, w, h) => {
    ctx.fillStyle = 'grey';
    ctx.beginPath();
    ctx.moveTo(x, y+h); //bottom left
    ctx.lineTo(x+w/2, y); //middle top
    ctx.lineTo(x+w, y+h); //bottom right
    ctx.closePath();
    ctx.fill();
  }
  ground = new Thing('ground', 2000, 200, 100, canvas.height/2-100, 'green', image);
  enemy = new Thing('enemy', 50, 80, 200, 0, 'grey', triangle);
  player = new Thing('player', 70, 70, 0, 0, 'green', rect);
  game.start();
  window.requestAnimationFrame(gameLoop);
}
