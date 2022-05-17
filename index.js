//https://nodejs.org/api/worker_threads.html
//Stupid stuff
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { fork } = require('child_process');
const child = fork(`${__dirname}/leaderboard.js`);
/*
✅ — Completed
⚠️ — In Progress
-------TODO-------
+ Finish spelling levels.  ✅
+ Add overall leaderboard sorting ✅
+ Add full game credits list ✅
+ Always On + Boost ✅
+ Add multi-level support for platformers ✅
+ Make the platformer longer.
+ Add more platformer levels. 
+ Mobile support for platfomer. 
+ Sort levels ✅
+ Button to go home, to retry, and next level ✅
+ Useless functions
+ Clicker section
+ Math section
+ Profiles with /@username ⚠️
*/
console.log('ON')

//Load Libraries
var Random = {
  random: Math.random,
  range: (min, max) => (Math.random() * (max - min) + min),
  choice: (choices) => {
    choices = Object.values(choices);
    return choices[Math.floor(Math.random() * choices.length)];
  }
}
const Database = require("@replit/database")
import fetch from 'node-fetch';
const db = new Database();
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const path = require("path");
const app = express();
const httpserver = http.Server(app);
const io = socketio(httpserver);
const directory = path.join(__dirname, "client");
var fs = require('fs');
const nunjucks = require('nunjucks');
/*
db.list().then(async keys => {
  for (let key of keys) {
    let u = await db.get(key);
    let user = {
        id: u.id,
        name: u.name,
        roles: u.roles,
        teams: u.teams,
        games: 0,
        score: 0,
        currentGame: false,
        completed: {},
        next: {
          file: null,
          level: null
        },
        profilepic: u.profilepic,
        bio: u.bio,
        isVerified: u.isVerified,
        realName: u.realName,
        levelsDone: 0,
      }
      db.set(key, user).then(() => { });
    //db.delete(key).then(() => { });
  }
})
*/
//Rate limiter
const { RateLimiterMemory } = require('rate-limiter-flexible');
const completeLimiter = new RateLimiterMemory({
  points: 4, // 4 points
  duration: 2, // per 2 seconds
});

function saveGames() {
  fs.writeFile("Games.json", JSON.stringify(Games), function(err) {
    if (err) {
      console.log(err);
    }
  });
}
async function getUserData(username) {
  let info = await fetch('https://replit.com/graphql', {
    method: 'POST',
    headers: {
      "X-Requested-With": "replit",
      "Origin": "https://replit.com",
      "Accept": "application/json",
      "Referrer": "https://replit.com/jdog787",
      "Content-Type": "application/json",
      "Connection": "keep-alive",
      "Host": "replit.com",
      "x-requested-with": "XMLHttpRequest",
      "User-Agent": "Mozilla/5.0"
    },
    body: JSON.stringify({
      query: `query getUserInfo ($username: String!) { userByUsername(username: $username) {bio, isVerified, fullName, image}}`,
      variables: {
        username: username
      }
    })
  }).then(res => res.json());
  return info.data.userByUsername;
};

var USERS = {};
var Online = {};
var UnameToUid = {};
var Leaderboards = {};
var clientUsers = {}
try {
  var Games = JSON.parse(fs.readFileSync('Games.json', 'utf8'));
} catch {
  var Games = JSON.parse(fs.readFileSync('GamesRevert.json', 'utf8'));
}
var GameFiles = Object.keys(Games);
var totalLevels = 0;
for (let f of GameFiles) {
  totalLevels += Object.keys(Games[f].levels).length;
}
console.log(totalLevels);
//Leaderboard
function sortLeaderboard(file, levelName) {
  child.send({ event: 'sort', file: file, level: levelName });
}
// Set Users
function setUser(uID, u) {
  USERS[uID] = u;
  return clientUsers[uID] = {
    bio: u.bio,
    image: u.profilepic,
    name: u.name,
    games: u.games,
    score: u.score,
    avg: Math.min(u.score / u.games || 0, 100),
    completed: u.completed,
    levelsDone: u.levelsDone
  };
}
db.list().then(async (keys) => {
  for (let uID of keys) {
    let u = await db.get(uID);
    for (let file in u.completed) {
      for (let level in u.completed[file]) {
        let lvl = u.completed[file][level]
        u.completed[file][level].rankingScore = lvl.score - lvl.time;
        if (lvl.time < Games[file].levels[level].recordTime && lvl.score == 100) {
          Games[file].levels[level].recordTime = lvl.time;
        } else if (lvl.time > Games[file].levels[level].worstTime) {
          Games[file].levels[level].worstTime = lvl.time;
        }
      }
    }
    setUser(uID, u);
    UnameToUid[u.name] = uID;
  }
  child.send({ event: 'ready', clientUsers: clientUsers }); 
  for (let file in Games) {
    Leaderboards[file] = {};
    for (let levelName in Games[file].levels) {
      sortLeaderboard(file, levelName);
    }
  }
  saveGames();
});

console.log('READY!')


//nunjucks templating (baiscly jinja for js)
nunjucks.configure('client', {
  autoescape: true,
  express: app
});

// Home Page
app.get('/', async function(req, res) {
  let uID = req.get('X-Replit-User-Id');
  let Uname = req.get('X-Replit-User-Name');
  let Uroles = req.get('X-Replit-User-Roles');
  let Uteams = req.get('X-Replit-User-Teams');
  let loggedin = false;
  if (uID) {
    loggedin = true;
    let user = await db.get(uID);
    if (!(user)) {
      let data = await getUserData(Uname);
      console.log('New User', Uname)
      let user = {
        id: uID,
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
        },
        profilepic: data.image,
        bio: data.bio,
        isVerified: data.isVerified,
        realName: data.fullName,
        levelsDone: 0,
      }
      child.send({ event: 'newuser', uID: uID, User: setUser(uID, user)});
      db.set(uID, user).then(() => { });
      USERS[uID] = user;
    }
  }
  res.render('index.html', {
    loggedin: loggedin,
    username: Uname
  });
});

//Profile pages
app.get('/@:name', async function(req, res) {
  res.render('profile.html', {
    name: req.params.name,
    user: clientUsers[UnameToUid[req.params.name]],
    totalLevels:totalLevels,
  })
});

//Start the server
app.use(express.static(directory));
const cors = require('cors');
app.use(cors({
  origin: 'https://tricky-really-dev.hg0428.repl.co/'
}));
httpserver.listen(3000);

//Sockets
io.on('connection', async (socket) => {
  let uID = socket.handshake.headers['x-replit-user-id'];
  let user = USERS[uID];
  Online[uID] = user.name;
  let unlockedGames = {};
  //Find which levels are locked for this user
  for (let file in Games) {
    let locked = false;
    unlockedGames[file] = {
      name: Games[file].name,
      levels: {}
    };
    for (let level in Games[file].levels) {
      for (let l of Games[file].levels[level].requiredCompletes) {
        if (!user.completed[file] || !user.completed[file][l] || !user.completed[file][l].score > 0) {
          locked = true;
          break;
        }
      }
      unlockedGames[file].levels[level] = {
        avgTime: Games[file].levels[level].avgTime,
        moves: Games[file].levels[level].moves,
        locked: locked,
        required: Games[file].levels[level].requiredCompletes,
        recordTime: Games[file].levels[level].recordTime,
        worstTime: Games[file].levels[level].worstTime
      }
    }
  }
  if (user.next.file && !unlockedGames[user.next.file].levels[user.next.level].locked) {
    socket.emit('level', user.next);
    user.next = { file: null, level: null }
  }
  socket.emit('Data', user, unlockedGames, Leaderboards);
  //Function to call when starting a level
  let startLvl = (file, level) => {
    if (!Games[file] || !Games[file].levels[level]) return null;
    if (unlockedGames[file].levels[level].locked) return false;
    let start = Date.now();
    let game = {
      file: file,
      level: level,
      start: start,
      ...Games[file][level]
    }
    user.currentGame = game;
    setUser(uID, user);
    db.set(uID, user).then(() => { });
    return true;
  }

  //Gets a random level for the user to play.
  let getLvl = () => {
    if (user.next.file && !unlockedGames[user.next.file].levels[user.next.level].locked) return user.next;
    let rand = Math.floor(Math.random() * (GameFiles.length - 1))
    let reset = false;
    while (rand < GameFiles.length) {
      let file = GameFiles[rand];
      for (let lvl in unlockedGames[file].levels) {
        if (!user.completed[file] || !user.completed[file][lvl] && !unlockedGames[file].levels[lvl].locked) {
          return {
            file: file,
            level: lvl
          }
        }
      }
      if (rand == 0) reset = true;
      if (reset) rand++;
      else rand = 0;
    }
    let file = Random.choice(GameFiles)
    return {
      file: file,
      level: Random.choice(Object.keys(Games[file].levels))
    }
  }
  //Load a game at next connection
  socket.on('next', (file, level) => {
    user.next.file = file;
    if (!level) {
      let levels = Object.keys(Games[file].levels);
      let levelnum = Object.keys(user.completed[file]).length;
      level = levels[levelnum]
      if (levelnum >= levels.length) level = Random.choice(levels);
    }
    user.next = {
      file: file,
      level: level
    }
    setUser(uID, user);
    db.set(uID, user).then(() => { });
  });
  //Get a game (when the start button is pressed)
  socket.on('get', () => {
    let game = getLvl();
    let res = startLvl(game.file, game.level);
    if (res) {
      socket.emit('level', game);
    }
  });
  //When the user selects a game to play
  socket.on('loadGame', (file, level) => {
    if (!level) {
      for (let lvl in unlockedGames[file].levels) {
        if (!user.completed[file] || !user.completed[file][lvl] && !unlockedGames[file].levels[lvl].locked) {
          level = lvl
        }
      }
    }
    startLvl(file, level)
  });
  //When the user completes a level
  socket.on('complete', async (score, time, moves) => {
    let end = Date.now();
    let game = user.currentGame;
    if (!game) {
      //console.log('!game')
      return;
    }
    try {
      await completeLimiter.consume(uID);
    } catch {
      //console.log('catch')
      return;
    }
    moves = Math.max(moves, game.moves || 0);
    score = Math.min(score, 100);
    if (score <= 0) return;
    time = Math.max(time, 0);
    let calcTime = end - game.start;
    //Set the min time to the calculated time - 300
    if (time < calcTime - 300) {
      time = calcTime - 300;
    }
    if (!user.completed[game.file]) {
      user.completed[game.file] = {}
    }

    //Update the user's scores
    if (!user.completed[game.file][game.level]) {
      user.completed[game.file][game.level] = {
        time: time,
        score: score,
        moves: moves,
        timesPlayed: 0
      };
      user.levelsDone++;
    } else if (score >= user.completed[game.file][game.level].score) {
    user.completed[game.file][game.level].score = score;
      if (time < user.completed[game.file][game.level].time) user.completed[game.file][game.level].time = time;
      if (moves < user.completed[game.file][game.level].moves) user.completed[game.file][game.level].moves = moves;
    }
    user.score += score;
    user.games++;
    user.completed[game.file][game.level].timesPlayed++;
    //Check if the user set a record
    if (time < Games[game.file].levels[game.level].recordTime) {
      Games[game.file].levels[game.level].recordTime = time;
    } else if (time > Games[game.file].levels[game.level].worstTime) {
      Games[game.file].levels[game.level].worstTime = time;
    }
    if (score > 0) {
      child.send({ event: 'updateuser', uID: uID, game:game ,result: user.completed[game.file][game.level]});
      sortLeaderboard(game.file, game.level);
    }
    
    user.currentGame = false;
    setUser(uID, user);
    db.set(uID, user).then(() => { });
    saveGames();
    console.log(`${user.name} finished with score ${score}, ${moves} moves, in ${time}ms.`);
  });
  //When the user disconnects
  socket.on("disconnecting", () => {
    delete Online[uID];
  })
})
child.on("message", (msg) => {
  Leaderboards = msg.Leaderboards;
}); 