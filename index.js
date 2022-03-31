var Random = {
  random: Math.random,
  range: (min, max) => (Math.random() * (max - min) + min),
  choice: (choices) => {
    if (choices instanceof Object) choices = Object.values(choices);
    return choices[Math.floor(Math.random() * choices.length)];
  }
}
console.log('ON')
const Database = require("@replit/database")
const db = new Database();
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const path = require("path");
const app = express();
const httpserver = http.Server(app);
const io = socketio(httpserver);
const directory = path.join(__dirname, "client");
const nunjucks = require('nunjucks');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const completeLimiter = new RateLimiterMemory(
  {
    points: 3, // 5 points
    duration: 3, // per second
});
let USERS = {};
db.list().then(async function(keys) {
      for (uID of keys) {
        let u = await db.get(uID);
        USERS[uID] = u;
      }
});
//nunjucks templating (baiscly jinja for js)
nunjucks.configure('client', {
  autoescape: true,
  express: app
});
/*
db.list().then(keys => {
  for (key of keys) {
    db.delete(key).then(()=>{});
  }
})
*/
var Games = {
  'games/spelling.js': {
    name:'Spelling',
    'pop':{
      avgTime: 2500,
      moves:3
    }, 
    'explode':{
      avgTime: 3500,
      moves:7
    }, 
    'replace':{
      avgTime: 4000,
      moves:7
    }, 
    'backwards':{
      avgTime: 5500,
      moves:4
    }, 
    'replaceAll':{
      avgTime: 15000,
      moves:3
    }, 
    'Keymap':{
      avgTime: 100000,
      moves:3
    }
  },
  'games/enemy.js':{
    name:'Platformer',
   'vinde':{
     avgTime: 1000,
   } 
  }
}
console.log('Getting Ready...')
app.get('/', async function(req, res) {
  let Uid = req.get('X-Replit-User-Id');
  let Uname = req.get('X-Replit-User-Name');
  let Uroles = req.get('X-Replit-User-Roles');
  let Uteams = req.get('X-Replit-User-Teams');
  let loggedin = false;
  if (Uid) {
    loggedin = true;
    if (!(await db.get(Uid))) {
      console.log('New User', Uname)
      let user = {
				id: Uid,
        name: Uname,
        roles: Uroles,
        teams: Uteams,
        games: 0,
        score: 0,
        currentGame: false,
        completed: {}
      }
      db.set(Uid, user).then(() => {});
      USERS[Uid] = user;
    }
  }
  res.render('index.html', {
    loggedin: loggedin,
    username: Uname
  });
})
app.use(express.static(directory));
httpserver.listen(3000);

//Socket IO
io.on('connection', async (socket) => {
  let userID = socket.handshake.headers['x-replit-user-id'];
  let user = await db.get(userID);
  let allUsers = {}
  for (uID in USERS) {
    let u = USERS[uID];
    allUsers[u.name] = {
      name:u.name,
      games: u.games,
      score: u.score,
      avg: Math.min(u.score/u.games || 0, 100),
      completed:u.completed
    };
  }
	socket.emit('Data', user, Games, allUsers);
  socket.on('get', () => {
    console.log(`@${user.name} requested a game.`);
    if (user.currentGame) {
      return socket.emit('level', user.currentGame)
    }
    let game;
    let tries=0
    while (tries < 15) {
      let file = Random.choice(Object.keys(Games));
      let levels = Object.keys(Games[file]);
      let index = levels.indexOf('name');
      if (index > -1) {
        levels.splice(index, 1);
      }
      let level = Random.choice(levels);
      game = {
        file: file,
        level: level,
        ...Games[file][level]
      }
      if (!user.completed[file] || !user.completed[file][game.level]) break;
      tries++;
    }
    user.currentGame = game;
    socket.emit('level', game)
    db.set(userID, user).then(() => { });
    USERS[userID] = user;
  })
  socket.on('loadGame', (file, level) => {
    if (Games[file]) {
      let game;
      if (!level) {
        let levels = Object.keys(Games[file]);
        let index = levels.indexOf('name');
        if (index > -1) {
          levels.splice(index, 1);
        }
        let level = Random.choice(levels);
        game = {
          file:file,
          level: level,
          ...Games[file][level]
        }
      } else if (Games[file][level]) {
        game = {
          file:file,
          level: level,
          ...Games[file][level]
        }
      } else {
        return;
      }
      user.currentGame = game;
      db.set(userID, user).then(() => {});
      USERS[userID] = user;
    }
  })
  socket.on('complete', async (score, time, moves) => {
    try {
      await completeLimiter.consume(userID);
    } catch {
      return;
    }
    if (!user.currentGame) return;
    moves = Math.max(moves, user.currentGame.moves);
    score = Math.min(score, 100);
    if (!user.completed[user.currentGame.file]) {
        user.completed[user.currentGame.file] = {}
    }
    if (!user.completed[user.currentGame.file][user.currentGame.level]) {
      user.completed[user.currentGame.file][user.currentGame.level] = {
          time:time,
          score:score,
          moves:moves
      };
    } else {
      let old = user.completed[user.currentGame.file][user.currentGame.level];
      if (score>old.score) user.completed[user.currentGame.file][user.currentGame.level].score=score;
      if (time<old.time)user.completed[user.currentGame.file][user.currentGame.level].time=time;
      if (moves<old.moves)user.completed[user.currentGame.file][user.currentGame.level].moves=moves;
    }
    user.currentGame = false; 
    user.games++;
    user.score += score;
		await db.set(user.id, user);
    USERS[user.id] = user;
    console.log(`@${user.name} just completed a game level with a score of ${score}/100 in ${time}ms`);
  });
  socket.on('leaderboard', () => {
    let userstr = [];
    db.list().then(async function(keys) {
      for (uID of keys) {
        u = await db.get(uID);
        let l = {
          name: u.name,
          games: u.games,
          score: u.score,
          avg: Math.min(u.score/u.games || 0, 100)
        }; 
        userstr.push(l);
      }
      socket.emit('leaderboard', userstr);
    }) 
  })
})