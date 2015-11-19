var _ = require('lodash-node');
var shuffle = require('knuth-shuffle-seeded');
var prep = require('./prep-work.js'),
    addToDictionary = prep.addToDictionary,
    MAX_WORD_LENGTH = prep.MAX_WORD_LENGTH,
    rd = prep.rd,
    cwDict = prep.cwDict;
var answers = [];
/*
answers = [
  {
    cell: cell,
    currentState: currentState,
    direction: 'across',
    index: 0,
    wordList: potentialWords,
    getCurrentWord: function() { return this.wordList[this.index]; },
    getNextWord: function() { return this.wordList[++this.index]; }
  },
  ...
]
*/

var utility = require('./utility-functions.js'),
    log = utility.log,
    grid = utility.grid,
    fullToMyRight = utility.fullToMyRight,
    fullBelow = utility.fullBelow,
    firstCellOfDown = utility.firstCellOfDown,
    firstCellOfAcross = utility.firstCellOfAcross,
    getTopCellInColumn = utility.getTopCellInColumn,
    getLeftMostCellInColumn = utility.getLeftMostCellInColumn,
    startOfWord = utility.startOfWord,
    isBlankCell = utility.isBlankCell,
    isEmpty = utility.isEmpty,
    isValidCell = utility.isValidCell,
    getAdjacentCell = utility.getAdjacentCell,
    getCellToRight = utility.getCellToRight,
    getCellBelow = utility.getCellBelow,
    getContents = utility.getContents,
    isOrigin = utility.isOrigin,
    isBlankOrWall = utility.isBlankOrWall,
    isLetter = utility.isLetter;

var inProcess = false;

function getCurrentStateAcross(cell, options={}) {
  var cells = [];
  var currentCell = cell;
  log('getCurrentStateAcross', 3);
  log(currentCell, 3);
  while(isValidCell(currentCell) && !isBlankCell(currentCell)) {
    if (options.cell && options.letter && options.cell === currentCell) {
      cells.push(options.letter);
    } else {
      cells.push(getContents(currentCell).toLowerCase());
    }
    currentCell = getCellToRight(currentCell);
  }
  return cells;
}

function getCurrentStateDown(cell, options={}) {
  var cells = [];
  var currentCell = cell;
  log('getCurrentStateDown...', 3);
  log(currentCell, 3);
  while(isValidCell(currentCell) && !isBlankCell(currentCell)) {
    if (options.cell && options.letter && options.cell === currentCell) {
      cells.push(options.letter);
    } else {
      cells.push(getContents(currentCell).toLowerCase());
    }
    currentCell = getCellBelow(currentCell);
  }
  return cells;
}

function getWordLists(state, testObj={}) {
  log('getWordLists', 3);
  // var cwDict = testObj.cwDict || cwDict;
  var wordLists = [];
  for (let i=0, len = state.length; i<len; i++) {
    let letter = state[i];
    if (isLetter(letter)) {
      log('get word lists from state: ' + state, 3);
      // log(_.flatten((cwDict[len][i+1][letter])), 3);
      // log(cwDict[2][1]['h'], 3);
      wordLists.push(_.flatten((cwDict[len][i+1][letter])));
    } else {
      log('get word lists from non letter state: ' + state, 3);
      // log(_.flatten((_.values(cwDict[len][i+1], function(arr) { return arr } ))), 3);
      wordLists.push(_.flatten((_.values(cwDict[len][i+1], function(arr) { return arr } ))));
    }
  }
  return wordLists;
}

function getPotentialWords(state) {
  var wordLists = getWordLists(state);
  var words = _.intersection(...wordLists);
  // return shuffle(words, 5);
  // currently fails with HANDY as 1 down (cw-1-3) and seed as 6
  return shuffle(words, 7);
}

function addWordToGrid(cell, direction, word) {
  log('next word: ' + word, 3);
  log('cell: ' + cell, 3);
  log('direction: ' + direction, 3);
  var nextCell = cell;
  if (direction === 'across') {
    for(let i=0; i<word.length; i++) {
      grid[nextCell] = word[i].toUpperCase();
      nextCell = getCellToRight(nextCell);
    }
  } else {
    for(let i=0; i<word.length; i++) {
      grid[nextCell] = word[i].toUpperCase();
      nextCell = getCellBelow(nextCell);
    }
  }
}

function getVerticalState(cell, letter) {
  log('getVerticalState...', 3);
  var topCell = getTopCellInColumn(cell);
  log('topCell: ' + topCell, 3);
  var options = { cell, letter };
  var state = getCurrentStateDown(topCell, options);
  log('state: ' + state, 3);
  return state;
}

function getHorizontalState(cell, letter) {
  log('getHorizontalState...', 3);
  log(cell, 3);
  log(letter, 3);
  var leftMostCell = getLeftMostCellInColumn(cell);
  log('leftMostCell: ' + leftMostCell, 3);
  var options = { cell, letter };
  var state = getCurrentStateAcross(leftMostCell, options);
  log('state: ' + state, 3);
  return state;
}

function isPotentialWord(state) {
  log('potentialWord...', 3);
  log(state, 3);
  // check length of getPotentialWords
  log('potential words: ' + getPotentialWords(state).length, 3);
  return getPotentialWords(state).length > 0;
  // return true;
}

function viableAnswer(cell, direction, word) {
  var nextCell = cell;
  log('viableAnswer...', 3);
  log(nextCell, 3);
  if (direction === 'across') {
    log('viable answer across');
    for(let i=0; i<word.length; i++) {
      if (!isPotentialWord(getVerticalState(nextCell, word[i]))) {
        return false;
      }
      nextCell = getCellToRight(nextCell);
    }
  } else {
    log('viable answer down');
    log(word);
    for(let i=0; i<word.length; i++) {
      if (!isPotentialWord(getHorizontalState(nextCell, word[i]))) {
        return false;
      }
      nextCell = getCellBelow(nextCell);
    }
  }
  return true;
}

function addWordAcross(cell) {
  log('addWordAcross...', 3);
  var currentState = getCurrentStateAcross(cell);
  var potentialWords = getPotentialWords(currentState);
  log(`currentState: ${currentState}`, 3);
  log(`potentialWords: ${potentialWords}`, 3);
  // TODO: try potential words until success
  // Option A: manage state / potential words for each square,
  // returning to word lists whenever we have a failure downstream
  // might employ injected factory for managing state
  // Option B: recursive solution -- seems appropriate,
  // but having hard time imagining how it might work
  // Option A
  log(cell, 3);
  var answer = {
    cell: cell,
    currentState: currentState,
    direction: 'across',
    index: 0,
    wordList: potentialWords,
    getCurrentWord: function() { return this.wordList[this.index]; },
    getNextWord: function() { return this.wordList[++this.index]; }
  };
  var word = answer.getCurrentWord();
  while (word && !viableAnswer(cell, 'across', word)) {
    word = answer.getNextWord();
  }
  if (word) {
    answers.push(answer);
    addWordToGrid(cell, 'across', word);
    return true;
  }
  return false;
}

function addWordDown(cell) {
  log('addWordDown...', 3);
  var currentState = getCurrentStateDown(cell);
  var potentialWords = getPotentialWords(currentState);
  log(`currentState: ${currentState}`, 3);
  log(`potentialWords: ${potentialWords}`, 3);
  log(cell, 3);
  var answer = {
    cell: cell,
    currentState: currentState,
    direction: 'down',
    index: 0,
    wordList: potentialWords,
    getCurrentWord: function() { return this.wordList[this.index]; },
    getNextWord: function() { return this.wordList[++this.index]; }
  };
  log(answer.wordList);
  var word = answer.getCurrentWord();
  while (word && !viableAnswer(cell, 'down', word)) {
    word = answer.getNextWord();
  }
  // If currentWord exists, then add word to grid
  // Otherwise, back up
  if (word) {
    answers.push(answer);
    addWordToGrid(cell, 'down', word);
    return true;
  }
  return false;
}

function alreadyFilled(cell) {
  return fullToMyRight(cell) && fullBelow(cell);
}

function addWords(cell) {
  log(`addWords: ${cell}`, 3);
  if (!fullToMyRight(cell)) {
    log('adding word across', 3);
    addWordAcross(cell);
    drawGrid();
  }
  if (!fullBelow(cell)) {
    log('adding word down', 3);
    if (!addWordDown(cell)) {
      return false;
    }
    drawGrid();
  }
  return true;
}

function findNextSquare(currentCell) {
  // if empty or a letter
  //   is this the beginning of an unfinished word (across or down)?
  //   (firstCellOfDown or firstCellOfAcross) and (fullToMyRight and fullBelow)
  //     return cell
  // log(`isBlankOrWall(${currentCell}): ${isBlankOrWall(currentCell)}`, 3);
  while(currentCell) {
    log(currentCell, 3);
    if (isBlankOrWall(currentCell)) {
      currentCell = getAdjacentCell(currentCell);
    } else if (firstCellOfAcross(currentCell) && !fullToMyRight(currentCell)) {
      return currentCell;
    } else if (firstCellOfDown(currentCell) && !fullBelow(currentCell)) {
      return currentCell
    } else {
      currentCell = getAdjacentCell(currentCell);
    }
  }
  log('NO CELLS FOUND', 3);
}

function drawGrid() {
  // process.stdout.write('\x1B[2J');
  for (let row=1; row<=5; row++) {
    let rowOutput = '';
    for (let col=1; col<=5; col++) {
      let contents = grid[`cw-${row}-${col}`];
      if (contents === 'blank') {
        rowOutput += '#';
      } else if (contents === '') {
        rowOutput += ' ';
      } else {
        rowOutput += contents.toUpperCase();
      }
      rowOutput += '  ';
    }
    log(rowOutput, 1);
  }
}

function restoreStateDown(cell, state) {
  for (let i=0; i<state.length; i++) {
    grid[cell] = state[i];
    cell = getCellBelow(cell);
  }
}

function restoreStateAcross(cell, state) {
  for (let i=0; i<state.length; i++) {
    grid[cell] = state[i];
    cell = getCellToRight(cell);
  }
}

function restoreGridState(cell, direction, state) {
  if (direction === 'across') {
    restoreStateAcross(cell, state);
  } else if (direction === 'down') {
    restoreStateDown(cell, state);
  }
}

function removeAnswerFromGrid(answer) {
  restoreGridState(answer.cell, answer.direction, answer.currentState);
}

function populate(cell='cw-1-1') {
  var iterations = 1;
  while(iterations++ < 10 && isValidCell(cell)) {
    var backingUp = false;

    // drawGrid();
    log(`populate...`, 3);
    log(`cell: ${cell}`, 3);
    log(`startOfWord: ${startOfWord(cell)}`, 3);
    if (startOfWord(cell)) {
      log(`calling addWords with ${cell}`, 3);
      var successfulAdd = addWords(cell);
      if (!successfulAdd) {
        // back up
        console.log('BACKING UP FROM...');
        drawGrid();
        var answer = answers[answers.length-1];
        console.log(answer.cell);
        console.log(answer.currentState);
        console.log(answer.direction);
        console.log(answer.index);
        console.log(answer.wordList.length);

        // TODO
        // look at previous entry in answers
        // each answer should keep track of which cells it populated

        // remove last answer from grid
        // and advance to next word in wordList
        console.log('removeLastAnswerFromGrid');
        removeAnswerFromGrid(answer);

        var word = answer.getNextWord();
        while (!word) {
          answers.length = answers.length-1; // remove last element
          answer = answers[answers.length-1];
          removeAnswerFromGrid(answer);
          word = answer.getNextWord();
        }
        addWordToGrid(answer.cell, answer.direction, word);

        // assign local var cell to previous answer cell
        // (in preparation for findNextSquare call below)

        // remove previous entry after clearing letters
        // move pointer on previous entry
        // return;
        backingUp = true;
        // return;
      }
    }
  // log(`findNextSquare for ${cell} returns ${findNextSquare(cell)}`, 3);
  // if (iterations++ < 5) {
  //   // setTimeout(function () {
  //     populate(findNextSquare(cell), success);
  //   // }, 500);
  // }
    if (!backingUp) {
      cell = findNextSquare(cell);
    }
  }
  console.log('iterations: ' + iterations);
  console.log('cell: ' + cell);
}

var start = function(cell) {
  rd.on('line', function(word) {
    if (word.length > 1 && word.length <= MAX_WORD_LENGTH) {
      addToDictionary(word);
    }
  }).on('close', function() {
    log(cwDict[2][1]['h'], 3);
    populate();
  });
}

module.exports = {
  start,
  getWordLists
};
