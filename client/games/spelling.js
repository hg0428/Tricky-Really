document.body.innerHTML = ``;
let game = new Game();
const words = {
    'pop': {
        word: 'pop',
        trick: {
            type: 'add',
            what: [
                ['o', 'o']
            ]
        },
        riddle:"There's a trick, can you see it? Type it right and you get cheated."
    },
    'explode': {
        word: 'explode',
        trick: {
            type: 'add',
            what: [
                ['ex', 'xxx']
            ]
        },
        riddle:"There's a trick, can you see it? Type it right and you get cheated."
    },
    'replace': {
        word: 'replace',
        trick: {
            type: 'add',
            what: [
                ['repl', 'it']
            ]
        },
        riddle:"There's a trick, can you see it? Type it right and you get cheated."
    },
    'backwards': {
        word: Random.choice(['what', 'random', 'superlongword', 'sloof lirpA']),
        trick: {
            type: 'backwards'
        },
        riddle:'Backwards you type, backpace you reverse.'
    },
    'replaceAll': {
        word: 'hello',
        trick: {
            type: 'replaceAll',
            what: ['h', 'hi']
        },
        riddle:'What changes can be reversed only by the new and the old united.'
    },
    'Keymap': {
        word: Random.choice(['simple', 'so-easy', 'keyboard', 'broken']),
        trick: {
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
        },
        riddle:'One letter is another and another is one.'
    }
}

let word = words[LEVEL];

document.body.innerHTML += `<center><h1>Spelling Game!</h1><h2>Spell <span class="word">${word.word}</span></h2><br/><br/><input id="box" type="text" placeholder="Spell ${word.word}"/><br/><button id="submit">Submit</button><br/><h3>Riddle: ${word.riddle}</h3></center>`;
let textbox = document.getElementById('box');
let submitBtn = document.getElementById('submit');
game.start();

let submit = function() {
    if (!game.running)return;
    game.complete();
    if (word.word === textbox.value) {
        socket.emit('complete', 100, game.time, game.moves);
        document.body.innerHTML = `<div class="center" style="color:green"><center><h1>Correct!</h1><h2>Completed in ${game.time/1000} seconds using ${game.moves} moves.</h2></center><br/><center><button class="extraLarge" onclick="location.reload();">Continue</button></center></div>`;
    } else {
        socket.emit('complete', 0, game.time, game.moves);
        document.body.innerHTML = `<div class="center" style="color:red"><center><h1>Incorrect!</h1></center><br/><center><button class="extraLarge" onclick="location.reload();">Continue</button></center></div>`;
    }
}
textbox.oninput = function() {
    game.moves++;
    if (word.trick.type === 'add') {
        for (i of word.trick.what) {
            if (textbox.value.endsWith(i[0])) {
                textbox.value += i[1];
            }
        }
        if (textbox.value == word.trick.what[0]) {
            textbox.value = word.trick.what[1];
        }
    } else if (word.trick.type === 'backwards') {
        textbox.value = textbox.value.slice(-1) + textbox.value.slice(0, -1);
    } else if (word.trick.type === 'replaceAll') {
        if (!(new RegExp(word.trick.what[1]+word.trick.what[0]).test(textbox.value))) {
          textbox.value = textbox.value.replaceAll(word.trick.what[1], word.trick.what[0]);
          textbox.value = textbox.value.replaceAll(word.trick.what[0], word.trick.what[1]);
        }
        textbox.value = textbox.value.replaceAll(word.trick.what[1]+word.trick.what[0], word.trick.what[0]);
    } else if (word.trick.type === 'keymap') {
        for (from in word.trick.what) {
            let to = word.trick.what[from]
            if (textbox.value.endsWith(from)) {
                textbox.value = textbox.value.slice(0, -from.length) + to;
                break;
            }
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