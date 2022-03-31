class Game {
  constructor() {
    this.startTime = null;
    this.running = false;
    this.moves = 0;
  }
  start() {
    this.running = true;
    this.startTime = Date.now();
  }
  complete() {
    if (this.running) {
      this.running = false;
      this.endTime = Date.now();
    }
  }
  get time() {
    let time = this.endTime || Date.now();
    return time - this.startTime;
  }
}
function Touching(obj1, obj2) {
    obj1.halfWidth = obj1.width/2;
    obj2.halfWidth = obj2.height/2;
    obj1.halfHeight = obj1.height/2;
    obj2.halfHeight = obj2.height/2;
    var ret = {
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
        var CenterX1 = obj1.x + obj1.halfWidth;
        var CenterY1 = obj1.y + obj1.halfHeight;
        var CenterX2 = obj2.x + obj2.halfWidth;
        var CenterY2 = obj2.y + obj2.halfHeight;

        // Calculate the distance between centers
        var diffX = CenterX1 - CenterX2;
        var diffY = CenterY1 - CenterY2;

        // Calculate the minimum distance to separate along X and Y
        var minXDist = obj1.halfWidth + obj2.halfWidth;
        var minYDist = obj1.halfHeight + obj2.halfHeight;

        // Calculate the depth of collision for both the X and Y axis
        var depthX = diffX > 0 ? minXDist - diffX : -minXDist - diffX;
        var depthY = diffY > 0 ? minYDist - diffY : -minYDist - diffY;

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