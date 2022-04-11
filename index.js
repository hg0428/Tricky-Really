/*
-------TODO-------
+ Finish spelling levels.
+ Add overall leaderboard sorting
+ Style leaderboard.
+ Add full game credits list/animation
+ Always On + Boost
+ Add multi-level support for platformers
+ Make the platformer longer
+ Add more platformer levels
+ Mobile support for platfomer
+ Sort levels ✅
+ Button to go home, to retry, and next level✅
+ Useless functions
+ Clicker section
+ Math section
+ Profiles with /@username
*/
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
    name: 'Spelling',
    'Switch it up': {
      avgTime: 3000,
      moves: 3,
      requiredCompletes: []
    },
    'Spell pop': {
      avgTime: 2500,
      moves: 3,
      requiredCompletes: []
    },
    'Explode': {
      avgTime: 3500,
      moves: 7,
      requiredCompletes: []
    },
    'Repl.itace': {
      avgTime: 4000,
      moves: 7,
      requiredCompletes: []
    },
    'Backwards?': {
      avgTime: 5500,
      moves: 4,
      requiredCompletes: ['Switch it up', 'Spell pop']
    },
    'REPLit': {
      avgTime: 1000,
      moves: 6,
      requiredCompletes: []
    },
    'Say hi!': {
      avgTime: 15000,
      moves: 3,
      requiredCompletes: ['Backwards?']
    },
    'My keyboard broke?': {
      avgTime: 100000,
      moves: 3,
      requiredCompletes: []
    },
    'QWERTY': {
      avgTime: 10000,
      moves: 10,
      requiredCompletes: ['My keyboard broke?']
    },
    'Try to say hello': {
      avgTime: 15000,
      moves: 5,
      requiredCompletes: ['Say hi!']
    },
  },
  'games/enemy.js': {
    name: 'Platformer',
    'vinde': {
      avgTime: 1000,
      moves: 0,
      requiredCompletes: []
    },
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
        completed: {},
        next: {
          file: null,
          level: null
        }
      }
      db.set(Uid, user).then(() => { });
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
  let get = () => {
    console.log(`@${user.name} requested a game.`);
    if (user.currentGame) {
      return socket.emit('level', user.currentGame)
    }
    let game;
    let file = user.next.file || Random.choice(Object.keys(Games));
    let level = user.next.level;
    if (!level) {
      let levels = Object.keys(Games[file]);
      let index = levels.indexOf('name');
      if (index > -1) {
        levels.splice(index, 1);
      }
      if (!user.completed[file]) {
        level = levels[0];
      } else {
        levelnum = Object.keys(user.completed[file]).length;
        level = levels[levelnum]
        if (levelnum >= levels.length) level = Random.choice(levels);
      }
    }
    game = {
      file: file,
      level: level,
      ...Games[file][level]
    }
    user.currentGame = game;
    user.next.file = user.next.level = null;
    socket.emit('level', game)
    db.set(userID, user).then(() => { });
    USERS[userID] = user;
  }
  if (user.next && user.next.file) {
    get();
  } else {
    user.next = {
      file: null,
      level: null
    };
  }
  let allUsers = {}
  let unlockedGames = {};
  for (uID in USERS) {
    let u = USERS[uID];
    allUsers[u.name] = {
      name: u.name,
      games: u.games,
      score: u.score,
      avg: Math.min(u.score / u.games || 0, 100),
      completed: u.completed
    };
  }
  for (file in Games) {
    let locked = false;
    unlockedGames[file] = {};
    for (level in Games[file]) {
      if (level === 'name') {
        unlockedGames[file][level] = Games[file][level];
        continue;
      }
      for (l of Games[file][level].requiredCompletes) {
        if (!user.completed[file] || !user.completed[file][l] || !user.completed[file][l].score > 0) {
          locked = true;
          break;
        }
      }
      unlockedGames[file][level] = {
        avgTime: Games[file][level].avgTime,
        moves: Games[file][level].moves,
        locked: locked,
        required: Games[file][level].requiredCompletes
      }
    }
  }
  socket.emit('Data', user, unlockedGames, allUsers);
  socket.on('next', (file, level) => {
    user.next.file = file;
    user.next.level = level;
    db.set(userID, user).then(() => { });
  });
  socket.on('get', get);
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
          file: file,
          level: level,
          ...Games[file][level]
        }
      } else if (Games[file][level]) {
        game = {
          file: file,
          level: level,
          ...Games[file][level]
        }
      } else return;
      user.currentGame = game;
      db.set(userID, user).then(() => { });
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
        time: time,
        score: score,
        moves: moves
      };
    } else {
      let old = user.completed[user.currentGame.file][user.currentGame.level];
      if (score > old.score) user.completed[user.currentGame.file][user.currentGame.level].score = score;
      if (time < old.time && score >= old.score) {
        user.completed[user.currentGame.file][user.currentGame.level].time = time;
      }
      if (moves < old.moves) user.completed[user.currentGame.file][user.currentGame.level].moves = moves;
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
          avg: Math.min(u.score / u.games || 0, 100)
        };
        userstr.push(l);
      }
      socket.emit('leaderboard', userstr);
    })
  })
})