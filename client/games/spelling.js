GAMES['games/spelling.js'] = function(LEVEL) {
  let game = new Game('games/spelling.js', LEVEL);
  let switchMode = Random.choice([['ice', 'nice', 2], ['cook', 'nook', 3]]);
  const words = {
    'Switch it up': {
      word: switchMode[0],
      tricks: {
        'switch': {
          what: [switchMode[1], switchMode[2]]
        }
      },
      riddle: 'Watch closely',
      credits: ['@hg0428']
    },
    'Spell pop': {
      word: 'pop',
      tricks: {
        'add': {
          what: [
            ['o', 'o']
          ]
        }
      },
      riddle: "There's a trick, can you see it? Type it right and you get cheated.",
      credits: ['@hg0428']
    },
    'Explode': {
      word: 'explode',
      tricks: {
        'add': {
          what: [
            ['ex', 'xxx']
          ]
        }
      },
      riddle: "There's a trick, can you see it? Type it right and you get cheated.",
      credits: ['@hg0428']
    },
    'Repl.itace': {
      word: 'replace',
      tricks: {
        'add': {
          what: [
            ['repl', 'it']
          ]
        }
      },
      riddle: "There's a trick, can you see it? Type it right and you get cheated.",
      credits: ['@hg0428']
    },
    'Backwards?': {
      word: Random.choice(['what', 'random', 'superlongword', 'backwards']),
      tricks: {
        'backwards': {}
      },
      riddle: 'Backwards you type, backpace you reverse.',
      credits: ['@hg0428']
    },
    'Say hi!': {
      word: 'hello',
      tricks: {
        'replaceAll': {
          what: ['h', 'hi']
        }
      },
      riddle: 'Type a letter it becomes two, type it again and the two become one.',
      credits: ['@hg0428']
    },
    'My keyboard broke?': {
      word: Random.choice(['simple', 'so-easy', 'keyboard', 'broken']),
      tricks: {
        'keymap': {
          type: 'keymap',
          what: {
            'e': 's',
            'i': 'o',
            'm': 'y',
            'p': 'w',
            'l': 't',
            'q': 'n',
            'h': 'g',
            'r': 'u',
            'a': 'k',
            'v': 'j',
            'c': 'z',
            'x': 'b',
            'd': 'f',
            '-': '=',
            '+': '_',
          }
        }
      },
      riddle: 'One letter is another and another is one.',
      credits: ['@hg0428']
    },
    'QWERTY': {
      word: 'qwertyuiop',
      tricks: {
        'keymap': {
          what: {
            'q': 'a',
            'w': 's',
            'e': 'd',
            'r': 'f',
            't': 'g',
            'y': 'h',
            'u': 'j',
            'i': 'k',
            'o': 'l',
            'p': ';',
            'z': 'x',
            'c': 'v',
            'b': 'n',
            'm': ','
          }
        }
      },
      riddle: 'Top line is middle and vise versa. (qwerty keyboards only)',
      credits: ['@lukeliu8', '@hg0428']
    },
    'Try to say hello': {
      word: 'hi',
      tricks: {
        'backwards': {},
        'switch': {
          what: ['hello', 1]
        },
        add: {
          what: [['llo', 'he']]
        }
      },
      riddle: "You're on your own this time. 😀",
      credits: ['@hg0428']
    },
    'REPLit': {
      word: 'replit',
      tricks: {
        add: { what: [['replit', ' is great'], ['repl it', ' is great']] },
        keymap: {
          what: {
            'i': ' i'
          }
        }
      },
      credits: ['@CuriousFox14', '@hg0428'],
      riddle: 'Watch out for the tricks!'
    },
    'Aaahhhhh!': {
      word: 'anger',
      tricks: {
        keymap: {
          what: {
            'a':'1',
            'n':'2',
            'g':'3',
            'e':'4',
            'r':'5',
          }
        },
        backwards:{},
        add: {
          what: [['anger', ' management']]
        }
      },
      credits: ['@hg0428', 'Angry Comments'],
      riddle: '3 tricks, good luck! I think you know how this works by now.'
    }
  }
  
  let word = words[LEVEL];
  let credits = word.credits || [];
  for (i in credits) {
    c = credits[i];
    credits[i] = `<a href="https://replit.com/${c}">${c}</a>`
  }
  credits = credits.join(', ');
  game.set(`<center><h1>Spelling Game!</h1><h2>Spell <span class="word" id="spelling-word">${word.word}</span></h2><br/><br/><input id="box" type="text" placeholder="Spell ${word.word}" onpaste="return false;" ondrop="return false;" autocomplete="off"/><br/><button id="submit">Submit</button><br/><h3>Riddle: ${word.riddle}</h3></center><span class="credits">Credits: ${credits}</span>`);
  let textbox = document.getElementById('box');
  textbox.focus();
  textbox.select();
  let submitBtn = document.getElementById('submit');
  let spellingWord = document.getElementById('spelling-word');
  game.start();
  
  let submit = function() {
    if (!game.running) return;
    if (word.word === textbox.value || word.word === textbox.value.trim()) {
      game.score = 100;
      game.Continue("Correct!", 'green', `Completed in ${game.time / 1000} seconds using ${game.moves} moves.`, game)
    } else {
      game.Continue('Incorrect!', 'red', '', game);
    }
    game.complete();
  }
  textbox.oninput = function() {
    textbox.value = textbox.value.toLowerCase();
    game.moves++;
    if (word.tricks['keymap']) {
      let trick = word.tricks['keymap'];
      for (from in trick.what) {
        let to = trick.what[from]
        if (textbox.value.endsWith(from)) {
          textbox.value = textbox.value.slice(0, -from.length) + to;
          break;
        } if (textbox.value.endsWith(to)) {
          textbox.value = textbox.value.slice(0, -to.length) + from;
          break;
        }
      }
    } if (word.tricks['backwards']) {
      let trick = word.tricks['backwards'];
      if (!trick.val) {
        trick.val = "";
        trick.len = 0
      }
      if (textbox.value.length >= trick.len) {
        textbox.value = textbox.value.slice(-1) + textbox.value.slice(0, -1);
      } else {
        textbox.value = trick.val.slice(1);
      }
      trick.val = textbox.value;
      trick.len = trick.val.length;
    } if (word.tricks['add']) {
      let trick = word.tricks['add'];
      for (i of trick.what) {
        if (textbox.value.endsWith(i[0])) {
          textbox.value += i[1];
        }
      }
      if (textbox.value == trick.what[0]) {
        textbox.value = trick.what[1];
      }
    } if (word.tricks['replaceAll']) {
      let trick = word.tricks['replaceAll'];
      if (!(new RegExp(trick.what[1] + trick.what[0]).test(textbox.value))) {
        textbox.value = textbox.value.replaceAll(trick.what[1], trick.what[0]);
        textbox.value = textbox.value.replaceAll(trick.what[0], trick.what[1]);
      }
      textbox.value = textbox.value.replaceAll(trick.what[1] + trick.what[0], trick.what[0]);
    } if (word.tricks['switch']) {
      let trick = word.tricks['switch'];
      if (textbox.value.length >= trick.what[1]) {
        if (!word.old) word.old = word.word;
        word.word = trick.what[0];
        textbox.placeholder = `Spell ${word.word}`;
        spellingWord.innerHTML = word.word;
      } else if (textbox.value.length < trick.what[1] && word.old) {
        word.word = word.old;
        textbox.placeholder = `Spell ${word.word}`;
        spellingWord.innerHTML = word.word;
      }
    }
  }
  submitBtn.onclick = submit;
  function handleKeyUp(e) {
    let code = e.keyCode || e.which || e.code || e.charCode;
    if (code === 13) {
      if (game.running) submit();
    }
  }
  document.addEventListener('keyup', handleKeyUp); 
}