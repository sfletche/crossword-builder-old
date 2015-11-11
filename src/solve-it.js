var _ = require('lodash-node');
var prep = require('./prep-work.js'),
    addToDictionary = prep.addToDictionary,
    MAX_WORD_LENGTH = prep.MAX_WORD_LENGTH,
    rd = prep.rd,
    cwDict = prep.cwDict;
var potentialAnswers = {};
/*
potentialAnswers = {
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

function addWordDown(cell) {
  console.log(`addWordDown: ${cell}`);
}

function getCurrentStateAcross(cell) {
  var cells = [];
  var currentCell = cell;
  while(isValidCell(currentCell) && !isBlankCell(currentCell)) {
    cells.push(getContents(currentCell));
    currentCell = getCellToRight(currentCell);
  }
  return cells;
}

function compileWordLists(err, data) {
}

function getWordLists(state) {
  var wordLists = [];
  for (let i=0, len = state.length; i<len; i++) {
    let letter = state[i];
    if (isLetter(letter)) {
      wordLists.push(Array.from(cwDict[len][i+1][letter]));
      // let key = 'cw:' + state.length + ':';
      // key += (parseInt(i, 10)+1) + ':';
      // key += state[i];
      // client.lpop(key)
      //   .then(console.log)
      //   .catch(console.log);
    }
  }
  return wordLists;
}

function getPotentialWords(state) {
  var wordLists = getWordLists(state);
  var words = _.intersection(...wordLists);
  return words;
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
      nextCell = getCellToRight(cell);
    }
  } else {
    for(let i=0; i<word.length; i++) {
      grid[nextCell] = word[i].toUpperCase();
      nextCell = getC;
    }
  }
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
  potentialAnswers[key] = {
    wordList: potentialWords,
    index: 0,
    getNextWord: function() { return this.wordList[this.index]; }
  };
  // add potentialAnswers.key.wordList[index] to the grid
  addWordToGrid(cell, 'across', potentialWords[0]);
}

function alreadyFilled(cell) {
  return fullToMyRight(cell) && fullBelow(cell);
}

function addWords(cell) {
  console.log(`addWords: ${cell}`);
  if (!fullToMyRight(cell)) {
    addWordAcross(cell);
  }
  if (!fullBelow(cell)) {
    console.log('adding word down');
    // addWordDown(cell);
  }
}

function findNextSquare(currentCell) {
  // if empty or a letter
  //   is this the beginning of an unfinished word (across or down)?
  //   (firstCellOfDown or firstCellOfAcross) and (fullToMyRight and fullBelow)
  //     return cell
  // console.log(`isBlankOrWall(${currentCell}): ${isBlankOrWall(currentCell)}`);
  while(true) {
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
  drawGrid();
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
    populate();
  });
}

module.exports = {
  start
};
