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

function getCurrentStateAcross(cell) {
  var cells = [];
  var currentCell = cell;
  while(isValidCell(currentCell) && !isBlankCell(currentCell)) {
    cells.push(getContents(currentCell).toLowerCase());
    currentCell = getCellToRight(currentCell);
  }
  return cells;
}

function getCurrentStateDown(cell, options={}) {
  var cells = [];
  var currentCell = cell;
  console.log('getCurrentStateDown...');
  console.log(currentCell);
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
  console.log('getWordLists');
  // var cwDict = testObj.cwDict || cwDict;
  var wordLists = [];
  for (let i=0, len = state.length; i<len; i++) {
    let letter = state[i];
    if (isLetter(letter)) {
      console.log('get word lists from state: ' + state);
      // console.log(_.flatten((cwDict[len][i+1][letter])));
      // console.log(cwDict[2][1]['h']);
      wordLists.push(_.flatten((cwDict[len][i+1][letter])));
    } else {
      console.log('get word lists from non letter state: ' + state);
      // console.log(_.flatten((_.values(cwDict[len][i+1], function(arr) { return arr } ))));
      wordLists.push(_.flatten((_.values(cwDict[len][i+1], function(arr) { return arr } ))));
    }
  }
  return wordLists;
}

function getPotentialWords(state) {
  var wordLists = getWordLists(state);
  var words = _.intersection(...wordLists);
  // return shuffle(words, 5);
  return shuffle(words);
}

function getDirectionFromKey(key) {
  if (key.indexOf('across')) {
    return 'across';
  } else {
    return 'down';
  }
}

function addWordToGrid(cell, direction, word) {
  console.log('next word: ' + word);
  console.log('cell: ' + cell);
  console.log('direction: ' + direction);
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
  console.log('getVerticalState...');
  var topCell = getTopCellInColumn(cell);
  console.log('topCell: ' + topCell);
  var options = { cell, letter };
  var state = getCurrentStateDown(topCell, options);
  console.log('state: ' + state);
  return state;
}

function getHorizontalState(cell, letter) {
  console.log('getHorizontalState...');
  var leftMostCell = getLeftMostCellInColumn(cell);
  console.log('leftMostCell: ' + leftMostCell);
  var options = { cell, letter };
  var state = getCurrentStateAcross(leftMostCell, options);
  console.log('state: ' + state);
  return state;
}

function isPotentialWord(state) {
  console.log('potentialWord...');
  console.log(state);
  // check length of getPotentialWords
  console.log('potential words: ', getPotentialWords(state).length);
  return getPotentialWords(state).length > 0;
  // return true;
}

function viableAnswer(cell, direction, word) {
  var nextCell = cell;
  console.log('viableAnswer...');
  console.log(nextCell);
  if (direction === 'across') {
    for(let i=0; i<word.length; i++) {
      if (!isPotentialWord(getVerticalState(nextCell, word[i]))) {
        return false;
      }
      nextCell = getCellToRight(nextCell);
    }
  } else {
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
  var currentState = getCurrentStateAcross(cell);
  var potentialWords = getPotentialWords(currentState);
  console.log(`currentState: ${currentState}`);
  console.log(`potentialWords: ${potentialWords}`);
  // TODO: try potential words until success
  // Option A: manage state / potential words for each square,
  // returning to word lists whenever we have a failure downstream
  // might employ injected factory for managing state
  // Option B: recursive solution -- seems appropriate,
  // but having hard time imagining how it might work
  // Option A
  console.log(cell);
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
  var currentState = getCurrentStateDown(cell);
  var potentialWords = getPotentialWords(currentState);
  console.log(`currentState: ${currentState}`);
  console.log(`potentialWords: ${potentialWords}`);
  console.log(cell);
  var key = `${cell}-down`;
  answers[key] = {
    wordList: potentialWords,
    index: 0,
    getCurrentWord: function() { return this.wordList[this.index]; },
    getNextWord: function() { return this.wordList[++this.index]; }
  };
  while (!viableAnswer(cell, 'down', answers[key].getCurrentWord())) {
    answers[key].getNextWord();
  }
  addWordToGrid(cell, 'down', potentialWords[0]);
}

function alreadyFilled(cell) {
  return fullToMyRight(cell) && fullBelow(cell);
}

function addWords(cell) {
  console.log(`addWords: ${cell}`);
  if (!fullToMyRight(cell)) {
    console.log('adding word across');
    addWordAcross(cell);
    drawGrid();
  }
  if (!fullBelow(cell)) {
    console.log('adding word down');
    addWordDown(cell);
    drawGrid();
  }
}

function findNextSquare(currentCell) {
  // if empty or a letter
  //   is this the beginning of an unfinished word (across or down)?
  //   (firstCellOfDown or firstCellOfAcross) and (fullToMyRight and fullBelow)
  //     return cell
  // console.log(`isBlankOrWall(${currentCell}): ${isBlankOrWall(currentCell)}`);
  while(currentCell) {
    console.log(currentCell);
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
  console.log('NO CELLS FOUND');
}

function drawGrid() {
  // process.stdout.write('\x1B[2J');
  for (let row=1; row<=4; row++) {
    let rowOutput = '';
    for (let col=1; col<=4; col++) {
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
    console.log(rowOutput);
  }
}

var iterations = 0;
function populate(cell='cw-1-1', success=true) {
  if (!isValidCell(cell)) return success;
  // drawGrid();
  console.log(`populate...`);
  console.log(`cell: ${cell}`);
  console.log(`success: ${success}`);
  console.log(`startOfWord: ${startOfWord(cell)}`);
  if (startOfWord(cell)) {
    console.log(`calling addWords with ${cell}`);
    addWords(cell);
  }
  // console.log(`findNextSquare for ${cell} returns ${findNextSquare(cell)}`);
  if (iterations++ < 4) {
    setTimeout(function () {
      populate(findNextSquare(cell), success);
    }, 500);
  }
}

var start = function(cell) {
  rd.on('line', function(word) {
    if (word.length > 1 && word.length <= MAX_WORD_LENGTH) {
      addToDictionary(word);
    }
  }).on('close', function() {
    console.log(cwDict[2][1]['h']);
    populate();
  });
}

module.exports = {
  start,
  getWordLists
};
