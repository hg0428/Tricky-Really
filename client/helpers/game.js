//let socket;
function onload() {
  socket = initSocket();
}
let head = document.getElementsByTagName('head')[0];
class Game {
  constructor(file, level) {
    this.file = file;
    this.level = level;
    this.startTime = null;
    this.running = false;
    this.moves = 0;
    this.score = 0;
    this.socket = socket;
    this.document = document.getElementById('GAME');
  }
  start() {
    this.running = true;
    this.startTime = Date.now();
  }
  append(html) {
    this.document.innerHTML += html;
  }
  set(html) {
    this.document.innerHTML = html;
  }
  appendChild(elem) {
    this.document.appendChild(elem);
  }
  loadCSS(path) {
    let style = document.createElement('link');
    style.href = path;
    style.type = 'text/css';
    style.rel = 'stylesheet';
    head.append(style);
  }
  color(color) {
    this.document.style.background = color;
  } 
  complete() {
    if (this.running) {
      this.running = false;
      this.endTime = Date.now();
      console.log(this.score, this.time, this.moves);
      this.socket.emit('complete', this.score, this.time, this.moves);
    }
  } Continue(msg, color, h2, game) {
    if (h2) h2 = `<h2>${h2}</h2>`;
    this.set(`<div class="center" style="color:${color}"><center><h1>${msg}</h1>${h2}</center><br/><center><button class="extraLarge continue" id="continue" onclick="onBack();">CONTINUE</button><br/><button onclick="" class="large" id="next-btn">Next Level</button><button onclick="" class="large" id="retry-btn">Retry Level</button></center></div>`);
    let nextBtn = document.getElementById('next-btn');
    let retryBtn = document.getElementById('retry-btn');
    let file = this.file;
    let level = this.level;
    nextBtn.onclick = () => {
      socket.emit("next", file);
      location.reload();
    }
    retryBtn.onclick = () => {
      socket.emit("next", file, level);
      location.reload();
    }
    document.addEventListener('keyup', (e) => {
      let code = e.keyCode || e.which || e.code || e.charCode;
      if (code === 13) {
        if (!game.running) {
          location.reload();
        }
      }
    });
  }
  get time() {
    let time = this.endTime || Date.now();
    return time - this.startTime;
  }
}
function Touching(obj1, obj2) {
  obj1.halfWidth = obj1.width / 2;
  obj2.halfWidth = obj2.height / 2;
  obj1.halfHeight = obj1.height / 2;
  obj2.halfHeight = obj2.height / 2;
  let ret = {
    touching: false,
    touchingX: false,
    touchingY: false,
    side: ""
  };
  if (!(
    obj1.x > obj2.x + obj2.width ||
    obj1.x + obj1.width < obj2.x ||
    obj1.y > obj2.y + obj2.height ||
    obj1.y + obj1.height < obj2.y
  )) {
    let CenterX1 = obj1.x + obj1.halfWidth;
    let CenterY1 = obj1.y + obj1.halfHeight;
    let CenterX2 = obj2.x + obj2.halfWidth;
    let CenterY2 = obj2.y + obj2.halfHeight;

    // Calculate the distance between centers
    let diffX = CenterX1 - CenterX2;
    let diffY = CenterY1 - CenterY2;

    // Calculate the minimum distance to separate along X and Y
    let minXDist = obj1.halfWidth + obj2.halfWidth;
    let minYDist = obj1.halfHeight + obj2.halfHeight;

    // Calculate the depth of collision for both the X and Y axis
    let depthX = diffX > 0 ? minXDist - diffX : -minXDist - diffX;
    let depthY = diffY > 0 ? minYDist - diffY : -minYDist - diffY;

    // Now that you have the depth, you can pick the smaller depth and move
    // along that axis.
    if (depthX != 0 && depthY != 0) {
      ret.touching = true;
      if (Math.abs(depthX) < Math.abs(depthY)) {
        // Collision along the X axis. React accordingly
        ret.touchingX = true;
        if (depthX > 0) {
          ret.side = "left";
        } else {
          ret.side = "right";
        }
      } else {
        ret.touchingY = true;
        // Collision along the Y axis.
        if (depthY > 0) {
          ret.side = "top";
        } else {
          ret.side = "bottom";
          // Bottom side collision
        }
      }
    }
  }
  return ret;
}