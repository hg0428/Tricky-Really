var LEVEL, ready, user;
let socket;
var MusicOn = false;
const START = document.getElementById('START');
const Select = document.getElementById('select');
const Leaderboard = document.getElementById('leaderboard');
const status = document.getElementById('status');
var Games, Leaderboards;

function initSocket() {
  if (!loggedin) return null;
  try {
    socket = io();
    return socket;
  } finally {
    socket.on('Data', (userData, games, leaderboards) => {
      status.innerHTML = 'Ready!';
      Leaderboards = leaderboards;
      user = userData;
      Games = games;
      ready = true;
    });
    socket.on('level', game => {
      loadLevel(game.file, game.level);
    });
  }
}

function Reset() {
  socket.emit('get');
  document.body.innerHTML = 'Loading...';
}

function onBack() {
  let over = document.getElementsByClassName('overcontroller');
  for (let o of over) {
    console.log(o.id);
    o.style.display = 'none';
  }
}

START.onclick = function() {
  if (!loggedin) {
    return alert('Sign in first.');
  } else if (!socket) {
    return alert('Waiting for page to load.');
  } else if (!ready) {
    return alert('Waiting for server...');
  }
  Reset();
};

function loadLevel(file, level) {
  if (!loggedin) {
    return alert('Sign in first.');
  } else if (!socket) {
    return alert('Waiting for page to load.');
  }
  LEVEL = level;
  let myScript = document.createElement('script');
  myScript.setAttribute('src', file);
  document.body.appendChild(myScript);
  socket.emit('loadGame', file, level);
}
Select.onclick = function() {
  console.log('ONCLICK');
  let premade = document.getElementById('selectLevel');
  if (premade) {
    return premade.style.display = 'block';
  }
  if (!user) alert('Waiting for server...');
  let completed = user.completed;
  let text = '';
  for (game in Games) {
    let g = '<div class="game">';
    g += `<h2 class="game-name">${Games[game].name}</h2>`;
    g += '<ul class="game-levels">';
    for (level in Games[game].levels) {
      if (level == 'name') continue;
      let gameData = Games[game].levels[level];
      let scoredata = '';
      let li = '';
      if (completed[game] && completed[game][level]) {
        let comp = completed[game][level];
        let color = 'green';
        let timecolor = 'green';
        if (comp.score == 100) color = 'blue';
        if (comp.score < 50) color = 'orange';
        if (comp.score < 10) color = 'red';
        if (comp.time > gameData.avgTime) timecolor = 'orange';
        if (
          Math.floor(comp.time / 1000) + 1 <
          Math.floor(gameData.avgTime / 1000)
        )
          timecolor = 'blue';
        //&#128274; lock
        scoredata = `<span style="color:${color};">${
          comp.score
          }%  <span style="color:${timecolor};">in ${Math.floor(
            comp.time / 1000
          )}s. </span></span><a onclick="levelLeaders('${game}', '${level}')" class="leaderboard">Leaderboard</a>`;
      } else {
        scoredata = `<span style="color:red;">NOT COMPLETED. </span><a onclick="levelLeaders('${game}', '${level}')" class="leaderboard">Leaderboard</a>`;
      }
      if (gameData.locked) {
        li = `<li class="locked tooltip">${level}&#128274;<span class="tooltiptext">Locked</span></li>`;
      } else {
        li = `<li onclick="loadLevel('${game}','${level}')" class="">${level}</li>`;
      }
      g += `${li}<span class="scores">${scoredata}</span>`;
    }
    g += '</ul>';
    g += '</div>';
    text += g;
  }
  document.body.insertAdjacentHTML("beforeend", `<div class="overcontroller" id="selectLevel"><button onclick="onBack();" class="back">Back</button><br/><br/><br/>${text}</div>`);
};
function makeLeaderboard(id, users, gen) {
  let premade = document.getElementById(`leaderboard-${id}`);
  if (premade) {
    premade.style.display = 'block';
    return;
  }
  let code =
    '<button onclick="onBack();" class="back">Back</button><br/><br/><br/><br/><div class="Leaderboard">';
  for (u of users) {
    let data = gen(u);
    if (data === false) continue;
    code += `<div class="player">${data}</div>`;
  }
  code += '</div>';
  document.body.innerHTML += `<div class="overcontroller" id="leaderboard-${id}">${code}</div>`;
}
function levelLeaders(file, level) {
  users = Leaderboards[file][level];
  makeLeaderboard(`${file}/${level}`, users, u => {
    if (!u.completed[file] || !u.completed[file][level]) return false;
    let data = u.completed[file][level];
    let gameData = Games[file].levels[level];
    if (data.score === 0) return false;
    let userclass = '';
    let scorecolor = 'green';
    let timecolor = 'green';
    if (data.score == 100) scorecolor = 'blue';
    if (data.score < 50) scorecolor = 'orange';
    if (data.score < 10) scorecolor = 'red';
    if (data.time > gameData.avgTime) timecolor = 'orange';
    if (Math.floor(data.time / 1000) + 1 < Math.floor(gameData.avgTime / 1000))
      timecolor = 'blue';
    if (u.name === user.name) {
      userclass = 'this';
    }
    return `<span class="player-image"><img src="${u.image}"/></span><span class="player-name ${userclass}">${
      u.name
      }:</span> &nbsp; <span style="color:${scorecolor}">${
      data.score
      }%</span> in <span style="color:${timecolor}">${(data.time / 1000).toFixed(
        2
      )} seconds</span>.`;
  });
}

Leaderboard.onclick = function() {
  if (!Leaderboards) {
    console.log('Waiting for server...');
    return false;
  }
  makeLeaderboard('overall', Leaderboards.overall, u => {
    let avgcolor = 'green';
    let gamescolor = 'green';
    let scorecolor = 'green';
    let userclass = '';
    if (u.avg > 99) avgcolor = 'blue';
    if (u.avg < 50) avgcolor = 'orange';
    if (u.avg < 10) avgcolor = 'red';
    if (u.games > 6) gamescolor = 'blue';
    if (u.games < 4) gamescolor = 'orange';
    if (u.score > 690) scorecolor = 'blue';
    if (u.score < 300) scorecolor = 'orange';
    if (u.score < 20) scorecolor = 'red';
    if (u.name === user.name) {
      userclass = 'this';
    }
    return `<span class="player-image"><img src="${u.image}"/></span><span class="player-name ${userclass}">${
      u.name
      }:</span> &nbsp;<span style="color:${avgcolor};">${Math.floor(
        u.avg
      )}% average</span>, &nbsp;<span style="color:${gamescolor};">${
      u.games
      } games played</span>, &nbsp;<span style="color:${scorecolor};">total score of ${
      u.score
      }</span>.`;
  });
};
function playMusic() {
  if (!MusicOn) {
    const music = new Audio('bgm.wav');
    music.volume = 0.1;
    music.loop = true;
    music.play();
    MusicOn = true;
  }
}
window.oncontextmenu = e => {
  playMusic();
  e.preventDefault();
};
document.addEventListener('keydown', function(event) {
  playMusic()
  var key = event.key || event.keyCode;
  if (key == 17) {
    return false;
  } else if (
    (event.ctrlKey && event.shiftKey && key == 73) ||
    (event.ctrlKey && event.shiftKey && key == 74)
  ) {
    return false;
  }
});
document.addEventListener('click', playMusic);
document.addEventListener('touchstart', playMusic);
window.addEventListener('onload', function() {
  Object.keys(window).forEach(key => {
    if (/^on/.test(key)) {
      console.log(key);
      window.addEventListener(key.slice(2), playMusic);
    }
  });
});