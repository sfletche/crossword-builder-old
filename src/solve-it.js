var _ = require('lodash-node');
var shuffle = require('knuth-shuffle-seeded');
var prep = require('./prep-work.js'),
    addToDictionary = prep.addToDictionary,
    MAX_WORD_LENGTH = prep.MAX_WORD_LENGTH,
    rd = prep.rd,
    cwDict = prep.cwDict;
var answers = {};
/*
answers = {
  'cw-1-3-down': {
    wordList: ['ha', 'hi', 'he'],
    index: 0
  }
}
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
  return shuffle(words, 3);
}

function getDirectionFromKey(key) {
  if (key.indexOf('across')) {
    return 'across';
  } else {
    return 'down';
  }
}

function addWordToGrid(cell, direction, word) {
  log('next word: ' + word, 3);
  log('cell: ' + cell, 3);
  log('direction: ' + direction, 3);
  var nextCell = cell;
  if (direction === 'across') {
    log('this for loop?');
    for(let i=0; i<word.length; i++) {
      grid[nextCell] = word[i].toUpperCase();
      nextCell = getCellToRight(nextCell);
    }
  } else {
    log('or this for loop?');
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
  var key = `${cell}-across`;
  answers[key] = {
    wordList: potentialWords,
    index: 0,
    getCurrentWord: function() { return this.wordList[this.index]; },
    getNextWord: function() { return this.wordList[++this.index]; }
  };
  while (!viableAnswer(cell, 'across', answers[key].getCurrentWord())) {
    answers[key].getNextWord();
  }
  // add answers.key.wordList[index] to the grid
  addWordToGrid(cell, 'across', answers[key].getCurrentWord());
}

function addWordDown(cell) {
  log('addWordDown...', 3);
  var currentState = getCurrentStateDown(cell);
  var potentialWords = getPotentialWords(currentState);
  log(`currentState: ${currentState}`, 3);
  log(`potentialWords: ${potentialWords}`, 3);
  log(cell, 3);
  var key = `${cell}-down`;
  answers[key] = {
    wordList: potentialWords,
    index: 0,
    getCurrentWord: function() { return this.wordList[this.index]; },
    getNextWord: function() { return this.wordList[++this.index]; }
  };
  log(answers[key].wordList);
  while (!viableAnswer(cell, 'down', answers[key].getCurrentWord())) {
    answers[key].getNextWord();
  }
  addWordToGrid(cell, 'down', answers[key].getCurrentWord());
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
    addWordDown(cell);
    drawGrid();
  }
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

var iterations = 0;
function populate(cell='cw-1-1', success=true) {
  if (!isValidCell(cell)) return success;
  // drawGrid();
  log(`populate...`, 3);
  log(`cell: ${cell}`, 3);
  log(`success: ${success}`, 3);
  log(`startOfWord: ${startOfWord(cell)}`, 3);
  if (startOfWord(cell)) {
    log(`calling addWords with ${cell}`, 3);
    addWords(cell);
  }
  // log(`findNextSquare for ${cell} returns ${findNextSquare(cell)}`, 3);
  if (iterations++ < 5) {
    // setTimeout(function () {
      populate(findNextSquare(cell), success);
    // }, 500);
  }
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
