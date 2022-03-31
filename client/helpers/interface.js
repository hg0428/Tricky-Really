let lastFrame = 0;
let programStart = Date.now();
 
window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame ||  window.msRequestAnimationFrame || function(funct) {
  if((Date.now()-programStart)-lastFrame >= 60 ) {
      lastFrame = Date.now()-programStart;
	    funct(lastFrame);
  } else {
      setTimeout(window.requestAnimationFrame, 59-((Date.now()-programStart)-lastFrame), funct); 
  }
}; 

class Key {
  constructor(code, text) {
    this.code = code;
    this.key = text;
    this.pressed = false;
  }
}
var KEYS = {
    pressed: new Set(),
    pressedKeys: new Set(),
    Keys: {
      
    }
      
};
var Random = {
    random: Math.random,
    range: (min, max) => (Math.random() * (max - min) + min),
    choice: (choices) => {
      if (choices instanceof Object) choices=Object.values(choices);
      return choices[Math.floor(Math.random() * choices.length)];
    }
}
document.addEventListener('keydown', (e) => {
  if (KEYS.Keys[e.key]) {
    KEYS.Keys[e.key].pressed=true;
  } else {
    let key = new Key(e.keyCode || e.code || e.which, e.key);
    key.pressed=true;
    KEYS.Keys[e.key] = key;
  }
  KEYS.pressed.add(KEYS.Keys[e.key]);
  KEYS.pressedKeys.add(e.key);
});
document.addEventListener('keyup', (e) => {
  if (KEYS.Keys[e.key]) {
    KEYS.Keys[e.key].pressed=false;
  } else {
    let key = new Key(e.keyCode || e.code || e.which, e.key);
    key.pressed=false;
    KEYS.Keys[e.key] = key;
  }
  KEYS.pressed.delete(KEYS.Keys[e.key]);
  KEYS.pressedKeys.delete(e.key);
});