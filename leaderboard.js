//finish
var ready = false;
var queue = [];
var queueRunning = false;
try {
  var Leaderboards = JSON.parse(fs.readFileSync('Leaderboards.json', 'utf8'));
} catch {
  var Leaderboards = {};
}
var clientUsers;
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
var fs = require('fs');
try {
  var Games = JSON.parse(fs.readFileSync('Games.json', 'utf8'));
} catch {
  var Games = JSON.parse(fs.readFileSync('GamesRevert.json', 'utf8'));
}
for (let file in Games) {
  if (!Leaderboards[file]) Leaderboards[file] = {};
}
process.on("message", (msg) => {
  if (msg.event === 'ready') {
    ready = true;
    clientUsers = msg.clientUsers;
  } else if (msg.event === 'newuser') {
    clientUsers[msg.uID] = msg.User;
  } else if (msg.event === 'updateuser') {
    clientUsers[msg.uID].completed[msg.game.file] = clientUsers[msg.uID].completed[msg.game.file] || {};
    clientUsers[msg.uID].completed[msg.game.file][msg.game.level] = msg.result;
  } else {
    queue.push({ file: msg.file, level: msg.level });
    if (!queueRunning) continueQueue();
  }
});
function continueQueue() {
  let start = Date.now();
  queueRunning = true;
  while (queue.length > 0) {
    sortLeaderboard(queue[0].file, queue[0].level);
    queue.shift();
    if (Date.now() - start > 120000) {
      sortOverall();
      start = Date.now();
    }
  }
  sortOverall();
  fs.writeFile("Leaderboards.json", JSON.stringify(Leaderboards), function(err) {
    if (err) {
      console.log(err);
    }
  });
  queueRunning = false;
}
function sortLeaderboard(file, levelName) {
  if (!Leaderboards[file]) {
    Leaderboards[file] = {}
  }
  Leaderboards[file][levelName] = Object.values(clientUsers).filter((u) => {
    return u.completed[file] && u.completed[file][levelName];
  });
  Leaderboards[file][levelName].sort((u1, u2) => {
    return (
      (u2.completed[file][levelName].score -
        u2.completed[file][levelName].time) -
      (u1.completed[file][levelName].score - u1.completed[file][levelName].time)
    );
  });
}
function sortOverall() {
  Leaderboards.overall = Object.values(clientUsers).filter((u) => {
    return u.levelsDone > 0;
  });
  Leaderboards.overall.sort((u1, u2) => {
    let sum1 = 0, sum2 = 0;
    let amt1 = 0, amt2 = 0;
    for (let file in u1.completed) {
      for (let lvl in u1.completed[file]) {
        let level = u1.completed[file][lvl]
        sum1 += level.rankingScore;
        amt1++;
      }
    }
    for (let file in u2.completed) {
      for (let lvl in u2.completed[file]) {
        let level = u2.completed[file][lvl]
        sum2 += level.rankingScore;
        amt2++;
      }
    }
    return ((sum2 / (amt2 - 1)) + amt2) - ((sum1 / (amt1 - 1)) + amt1);
  });
  process.send({ Leaderboards: Leaderboards })
}