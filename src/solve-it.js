var _ = require('lodash-node');
var prep = require('./prep-work.js'),
    addToDictionary = prep.addToDictionary,
    MAX_WORD_LENGTH = prep.MAX_WORD_LENGTH,
    rd = prep.rd,
    cwDict = prep.cwDict;

var utility = require('./utility-functions.js'),
    grid = utility.grid,
    fullToMyRight = utility.fullToMyRight,
    fullBelow = utility.fullBelow,
    startOfWord = utility.startOfWord,
    isBlankCell = utility.isBlankCell,
    isEmpty = utility.isEmpty,
    isValidCell = utility.isValidCell,
    getAdjacentCell = utility.getAdjacentCell,
    getCellToRight = utility.getCellToRight,
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

}

function alreadyFilled(cell) {
  return fullToMyRight(cell) && fullBelow(cell);
}

function addWords(cell) {
  console.log(`addWords: ${cell}`);
  if (!fullToMyRight(cell)) {
    addWordAcross(cell);
  }
  // if (!fullBelow(cell)) {
  //   addWordDown(cell);
  // }
}

function findNextSquare(currentCell) {
  // console.log(`isBlankOrWall(${currentCell}): ${isBlankOrWall(currentCell)}`);
  while(isBlankOrWall(currentCell)) {
    currentCell = getAdjacentCell(currentCell);
  }
  return currentCell;
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
    }, 1000);
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
