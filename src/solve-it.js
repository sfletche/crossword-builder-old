var _ = require('lodash-node');
var shuffle = require('knuth-shuffle-seeded');
var answers = [];
var cwDict = {};
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
  var wordLists = [];
  for (let i=0, len = state.length; i<len; i++) {
    let letter = state[i];
    if (isLetter(letter)) {
      wordLists.push(_.flatten((cwDict[len][i+1][letter])));
    } else {
      wordLists.push(_.flatten((_.values(cwDict[len][i+1], function(arr) { return arr } ))));
    }
  }
  return wordLists;
}

function getPotentialWords(state) {
  var wordLists = getWordLists(state);
  var words = _.intersection(...wordLists);
  return shuffle(words);
}

function addWordToGrid(cell, direction, word) {
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
  var topCell = getTopCellInColumn(cell);
  var options = { cell, letter };
  var state = getCurrentStateDown(topCell, options);
  return state;
}

function getHorizontalState(cell, letter) {
  var leftMostCell = getLeftMostCellInColumn(cell);
  var options = { cell, letter };
  var state = getCurrentStateAcross(leftMostCell, options);
  return state;
}

function isPotentialWord(state) {
  return getPotentialWords(state).length > 0;
}

function viableAnswer(cell, direction, word) {
  var nextCell = cell;
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
  var currentState = getCurrentStateDown(cell);
  var potentialWords = getPotentialWords(currentState);
  var answer = {
    cell: cell,
    currentState: currentState,
    direction: 'down',
    index: 0,
    wordList: potentialWords,
    getCurrentWord: function() { return this.wordList[this.index]; },
    getNextWord: function() { return this.wordList[++this.index]; }
  };
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
  if (!fullToMyRight(cell)) {
    addWordAcross(cell);
    drawGrid();
  }
  if (!fullBelow(cell)) {
    if (!addWordDown(cell)) {
      return false;
    }
    drawGrid();
  }
  return true;
}

function findNextSquare(currentCell) {
  while(currentCell) {
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
}

function drawGrid() {
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
    console.log(rowOutput);
  }
  console.log();
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
    if (startOfWord(cell)) {
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

        backingUp = true;
      }
    }
    if (!backingUp) {
      cell = findNextSquare(cell);
    }
  }
  console.log('iterations: ' + iterations);
  console.log('cell: ' + cell);
}

var start = function(cell) {
  var jsonfile = require('jsonfile');
  var readline = require('readline');
  var util = require('util');

  var file = 'word_lists/words5.json';
  jsonfile.readFile(file, function(err, obj) {
    cwDict = obj;
    populate();
  });
}

module.exports = {
  start,
  getWordLists
};
