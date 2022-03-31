var LEVEL, socket, ready, user;
const START = document.getElementById('START');
const Select = document.getElementById('select');
const Leaderboard = document.getElementById('leaderboard');
const status = document.getElementById('status');
var Games, Users;


function onload() {
    if (!loggedin) return;
    socket = io();
    socket.on('Data', (userData, games, users) => {
        status.innerHTML = 'Ready!';
        user = userData;
        Games = games;
        Users = users;
        ready = true;
    })
    socket.on('level', (game) => {
        loadLevel(game.file, game.level);
    });
}

function Reset() {
    socket.emit('get');
    document.body.innerHTML = 'Loading...';
}
START.onclick = function() {
    if (!loggedin) {
        return alert('Sign in first.')
    } else if (!socket) {
        return alert('Waiting for page to load.');
    } else if (!ready) {
        return alert('Waiting for server...')
    }
    Reset();
};

function loadLevel(file, level) {
    if (!loggedin) {
        return alert('Sign in first.')
    } else if (!socket) {
        return alert('Waiting for page to load.');
    } else if (!ready) {
        return alert('Waiting for server...')
    }
    const music = new Audio("bgm.wav");
    music.volume = 0.3;
    music.loop = true;
    music.play();
    LEVEL = level;
    let myScript = document.createElement("script");
    myScript.setAttribute("src", file);
    document.body.appendChild(myScript);
    socket.emit('loadGame', file, level);
}
Select.onclick = function() {
    if (!user) console.log('Waiting for server...');
    completed = user.completed;
    let text = "";
    for (game in Games) {
        let g = '<div class="game">';
        g += `<h2 class="game-name">${Games[game].name}</h2>`;
        g += '<ul class="game-levels">';
        for (level in Games[game]) {
            if (level == 'name') continue;
            let data = '';
            if (completed[game] && completed[game][level]) {
                let comp = completed[game][level];
                let gameData = Games[game][level];
                let color = 'green';
                let timecolor = 'green';
                if (comp.score == 100) color = 'blue';
                if (comp.score < 50) color = 'orange';
                if (comp.score < 10) color = 'red';
                if (comp.time > gameData.avgTime) timecolor = 'orange';
                if (Math.floor(comp.time / 1000) + 1 < Math.floor(gameData.time / 1000)) timecolor = 'blue';
                data = `<span style="color:${color};">${comp.score}%  <span style="color:${timecolor};">in ${Math.floor(comp.time/1000)}s. </span></span><a onclick="levelLeaders('${game}', '${level}')" class="leaderboard">Leaderboard</a>`
            } else {
                data = `<span style="color:red;">NOT COMPLETED. </span><a onclick="levelLeaders('${game}', '${level}')" class="leaderboard">Leaderboard</a>`;
            }
            g += `<li onclick="loadLevel('${game}','${level}')">${level}</li><span class="scores">${data}</span>`;
        }
        g += '</ul>';
        g += '</div>';
        text += g;
    }
    document.body.innerHTML = `<button onclick="location.reload();" class="back">Back</button><br/><br/><br/>${text}`;
}
function makeLeaderboard(users, gen) {
  document.body.innerHTML = '<button onclick="location.reload();" class="back">Back</button><ul class="levels"><br/><br/><br/>';
    for (user of users) {
        let data = gen(user);
        if (data === false) continue;
        document.body.innerHTML += `<li>${data}</li>`;
    }
    document.body.innerHTML += '</ul>';
}
function levelLeaders(file, level) {
    let users = Object.values(Users);
    console.log(Users, users);
    users.sort((u1, u2) => {
      if (u1.completed[file] && u1.completed[file][level] && u2.completed[file] && u2.completed[file][level]) {
        //return (u1.completed[file][level].time) - u2.completed[file][level].time;
        return (2*u2.completed[file][level].score-u2.completed[file][level].time) - (2*u1.completed[file][level].score-u1.completed[file][level].time);
      }
      return u2.avg-u1.avg;
    });
    makeLeaderboard(users, user=>{
      if (!user.completed[file] || !user.completed[file][level]) return false;
      let data=user.completed[file][level];
      if (data.score===0)return false;
      return `<span style="font-size:18px;font-weight:bold;">${user.name}:</span> &nbsp; ${data.score}% in ${data.time/1000} seconds.`;//FIX LATER
      //add colors later
    });
}

Leaderboard.onclick = function() {
    if (!Users) console.log('Waiting for server...');
    let users = Object.values(Users);
    users.sort((u1, u2) => {
        return (u2.avg * (u2.score+u2.games)) - (u1.avg * (u1.games+u1.score));
    });
    makeLeaderboard(users, user=>{
      let avgcolor = 'green';
      let gamescolor = 'green';
      let scorecolor = 'green';
      if (user.avg>99) avgcolor='blue';
      if (user.avg<50)avgcolor='orange';
      if (user.avg<10)avgcolor='red';
      if (user.games>6)gamescolor='blue';
      if (user.games<4)gamescolor='orange';
      if (user.score>690)scorecolor='blue';
      if (user.score<300)scorecolor='orange';
      if (user.score<20)scorecolor='red';
      return `<span style="font-size:18px;font-weight:bold;">${user.name}:</span> &nbsp;<span style="color:${avgcolor};">${Math.floor(user.avg)}% average</span>, &nbsp;<span style="color:${gamescolor};">${user.games} games played</span>, &nbsp;<span style="color:${scorecolor};">total score of ${user.score}</span>.`;
    });
}