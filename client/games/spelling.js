document.body.innerHTML = ``;
let game = new Game();
let switchMode = Random.choice([['ice', 'nice', 2], ['cook', 'nook', 3]]);
const words = {
  'Switch it up': {
    word: switchMode[0],
    tricks: {
      'switch': {
        type: 'switch',
        what: [switchMode[1], switchMode[2]]
      }
    },
    riddle: 'Watch closely'
  },
  'Spell pop': {
    word: 'pop',
    tricks: {
      'add': {
        type: 'add',
        what: [
          ['o', 'o']
        ]
      }
    },
    riddle: "There's a trick, can you see it? Type it right and you get cheated."
  },
  'Explode': {
    word: 'explode',
    tricks: {
      'add': {
        type: 'add',
        what: [
          ['ex', 'xxx']
        ]
      }
    },
    riddle: "There's a trick, can you see it? Type it right and you get cheated."
  },
  'Repl.itace': {
    word: 'replace',
    tricks: {
      'add': {
          type: 'add',
          what: [
            ['repl', 'it']
          ]
      }
    },
    riddle: "There's a trick, can you see it? Type it right and you get cheated."
  },
  'Backwards?': {
    word: Random.choice(['what', 'random', 'superlongword', 'backwards']),
    tricks: {
      'backwards': {
        type: 'backwards'
      }
    },
    riddle: 'Backwards you type, backpace you reverse.'
  },
  'Say hi!': {
    word: 'hello',
    tricks: {
      'replaceAll': {
        type: 'replaceAll',
        what: ['h', 'hi']
      }
    },
    riddle: 'Type a letter it becomes two, type it again and the two become one.'
  },
  'My keyboard broke?': {
    word: Random.choice(['simple', 'so-easy', 'keyboard', 'broken']),
    tricks: {
      'keymap': {
        type: 'keymap',
        what: {
          's': 'e',
          'e': 's',
          'i': 'o',
          'o': 'i',
          'm': 'y',
          'y': 'm',
          'p': 'w',
          'w': 'p',
          'l': 't',
          't': 'l',
          'q': 'n',
          'n': 'q',
          'h': 'g',
          'g': 'h',
          'r': 'u',
          'u': 'r',
          'a': 'k',
          'k': 'a',
          'v': 'j',
          'j': 'v',
          'c': 'z',
          'z': 'c',
          'x': 'b',
          'b': 'x',
          'd': 'f',
          'f': 'd',
          '-': '=',
          '=': '-',
          '+': '_',
          '_': '+'
        }
      }
    },
    riddle: 'One letter is another and another is one.'
  }
}

let word = words[LEVEL];

document.body.innerHTML += `<center><h1>Spelling Game!</h1><h2>Spell <span class="word" id="spelling-word">${word.word}</span></h2><br/><br/><input id="box" type="text" placeholder="Spell ${word.word}"/><br/><button id="submit">Submit</button><br/><h3>Riddle: ${word.riddle}</h3></center>`;
let textbox = document.getElementById('box');
let submitBtn = document.getElementById('submit');
let spellingWord = document.getElementById('spelling-word');
game.start();

let submit = function() {
  if (!game.running) return;
  game.complete();
  if (word.word === textbox.value) {
    game.socket.emit('complete', 100, game.time, game.moves);
    document.body.innerHTML = `<div class="center" style="color:green"><center><h1>Correct!</h1><h2>Completed in ${game.time / 1000} seconds using ${game.moves} moves.</h2></center><br/><center><button class="extraLarge continue" onclick="location.reload();">CONTINUE</button></center></div>`;
  } else {
    game.socket.emit('complete', 0, game.time, game.moves);
    document.body.innerHTML = `<div class="center" style="color:red"><center><h1>Incorrect!</h1></center><br/><center><button class="extraLarge continue" onclick="location.reload();">CONTINUE</button></center></div>`;
  }
}
textbox.oninput = function() {
  textbox.value=textbox.value.toLowerCase();
  game.moves++;
  if (word.tricks['add']) {
    let trick = word.tricks['add'];
    for (i of trick.what) {
      if (textbox.value.endsWith(i[0])) {
        textbox.value += i[1];
      }
    }
    if (textbox.value == trick.what[0]) {
      textbox.value = trick.what[1];
    }
  } else if (word.tricks['backwards']) {
    let trick = word.tricks['backwards'];
    textbox.value = textbox.value.slice(-1) + textbox.value.slice(0, -1);
  } else if (word.tricks['replaceAll']) {
    let trick = word.tricks['replaceAll'];
    if (!(new RegExp(trick.what[1] + trick.what[0]).test(textbox.value))) {
      textbox.value = textbox.value.replaceAll(trick.what[1], trick.what[0]);
      textbox.value = textbox.value.replaceAll(trick.what[0], trick.what[1]);
    }
    textbox.value = textbox.value.replaceAll(trick.what[1] + trick.what[0], trick.what[0]);
  } else if (word.tricks['keymap']) {
    let trick = word.tricks['keymap'];
    for (from in trick.what) {
      let to = trick.what[from]
      if (textbox.value.endsWith(from)) {
        textbox.value = textbox.value.slice(0, -from.length) + to;
        break;
      }
    }
  } else if (word.tricks['switch']) {
    let trick = word.tricks['switch'];
    if (textbox.value.length >= trick.what[1]) {
      if (!word.old) word.old = word.word;
      word.word = trick.what[0];
      textbox.placeholder = word.word;
      spellingWord.innerHTML = word.word;
    } else if (textbox.value.length < trick.what[1] && word.old) {
      word.word = word.old;
      textbox.placeholder = word.word;
      spellingWord.innerHTML = word.word;
    }
  }
}
submitBtn.onclick = submit;
document.addEventListener('keyup', (e) => {
  let code = e.keyCode || e.which || e.code || e.charCode;
  if (code === 13) {
    if (game.running) submit();
    else location.reload();
  }
})