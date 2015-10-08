var _ = require('lodash-node');
var init = require('./prep-work.js');
var utility = require('./utility-functions.js'),
    fullToMyRight = utility.fullToMyRight,
    fullBelow = utility.fullBelow,
    startOfWord = utility.startOfWord,
    isBlankCell = utility.isBlankCell,
    isEmpty = utility.isEmpty,
    isValidCell = utility.isValidCell,
    getAdjacentCell = utility.getAdjacentCell,
    getContents = utility.getContents,
    isOrigin = utility.isOrigin,
    isBlankOrWall = utility.isBlankOrWall;
// var ui = require('./app.js');

// var originalCell = undefined;

// function findNextOpenSquare(currentCell) {
//   console.log('findNextOpenSquare');
//   console.log(currentCell);
//   if (originalCell && _.isEqual(originalCell, currentCell)) {
//     return;
//   } else if (!originalCell) {
//     originalCell = currentCell;
//   }
//   if (isEmpty(currentCell)) {
//     return currentCell;
//   } else {
//     return findNextOpenSquare(getAdjacentCell(currentCell));
//   }
// }

var inProcess = false;

function findNextSquare(currentCell) {
  var nextCell = currentCell;
  if(inProcess && isOrigin(currentCell)) {
    return;
  }
  inProcess = true;
  while(isBlankOrWall(nextCell)) {
    nextCell = getAdjacentCell(nextCell);
  }
  return nextCell;
}

function addWordDown(cell) {
  console.log('addWordDown');
  debugger;
}

function getCurrentStateAcross(cell) {
  var cells = [];
  var currentCell = cell;
  console.log('getCurrentStateAcross');
  console.log(currentCell);
  while(isValidCell(currentCell) && !isBlankCell(currentCell)) {
    console.log(getContents(currentCell));
    cells.push(getContents(currentCell));
    currentCell = cell;
  }
  return cells;
}

function getPotentialWords(state) {
  debugger;
}

function addWordAcross(cell) {
  console.log('addWordAcross');
  var currentState = getCurrentStateAcross(cell);
  var potentialWords = getPotentialWords(currentState);
  console.log(currentState);
  console.log(potentialWords);
}

function alreadyFilled(cell) {
  console.log('alreadyFilled');
  console.log('full to my right: ' + fullToMyRight(cell));
  console.log('full below: ' + fullBelow(cell));
  return fullToMyRight(cell) && fullBelow(cell);
}

function addWords(cell) {
  console.log('addWords');
  console.log(cell);
  var success = true;
  console.log('calling fullToMyRight');
  if (!fullToMyRight(cell)) {
    console.log('not full to my right');
    success = success && addWordAcross(cell);
  }
  console.log('calling fullBelow');
  if (!fullBelow(cell)) {
    console.log('not full below');
    success = success && addWordDown(cell);
  }
  return success;

}

function populate(cell) {
  console.log('populate');
  console.log(cell);
  var potentialWords = [];
  var success = true;

  if (startOfWord(cell)) {
    success = success && addWords(cell);
  }
  return success;
}

var loop = 1;

function start(cell) {
  // var nextCell = findNextOpenSquare(cell);
  console.log('start');
  console.log(cell);
  if (!cell) {
    console.log('fini');
  }
  if (populate(cell)) {
    loop += 1;
    if (loop > 10) {
      return
    }
    start(findNextSquare(cell));
  } else {
    console.log('back up...');
  }
}

// (function setup() {
//   init.buildDictionary();
//   solveIt();
// })();

module.exports = {
  start: start
};