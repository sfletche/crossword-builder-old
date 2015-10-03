var _ = require('lodash-node');
var init = require('./prep-work.js');
// var ui = require('./app.js');

const NUM_ROWS = 4;
const NUM_COLS = 4;

function isValidCell(cell) {
  return cell &&
         cell.row >= 0 && cell.row <= NUM_ROWS &&
         cell.col >= 0 && coll.col <= NUM_COLS;
}

var originalCell = undefined;

function getAdjacentCell(cell) {
  console.log(cell);
  var [cw,row,col] = cell.split('-');
  row = parseInt(row,10);
  col = parseInt(col,10);
  col += 1;
  row = col > NUM_COLS ? row + 1 : row;
  col = col > NUM_COLS ? 1 : col;
  if (row > NUM_ROWS) {
    return;
  }
  return [cw, row, col].join('-');
}

function findNextOpenSquare(currentCell) {
  if (originalCell && _.isEqual(originalCell, currentCell)) {
    return;
  } else if (!originalCell) {
    originalCell = currentCell;
  }
  var adjacentCell = getAdjacentCell(currentCell);
  if (!isEmpty(adjacentCell)) {
    return findNextOpenSquare(adjacentCell);
  } else {
    return adjacentCell;
  }
}

function getCellAbove(cell) {
  var [cw,row,col] = cell.split('-');
  return [cw, row-1, col].join('-');
}

function getCellBelow(cell) {
  var [cw,row,col] = cell.split('-');
  return [cw, row+1, col].join('-');
}

function getCellToLeft(cell) {
  var [cw,row,col] = cell.split('-');
  return [cw, row, col-1].join('-');
}

function getCellToRight(cell) {
  var [cw,row,col] = cell.split('-');
  return [cw, row, col+1].join('-');
}

function isBlankOrWall(cell) {
  return !isValidCell(cell) || isBlankCell(cell);
}

function isBlankCell(cell) {
  return getContents(cell) === 'blank';
}

function nothingToMyLeft(cell) {
  var [cw,row,col] = cell.split('-');
  var cellToLeft = getCellToLeft(cell);
  return isBlankOrWall(cellToLeft);
}

function firstCellOfAcross(cell) {
  return nothingToMyLeft(cell);
}

function nothingAboveMe(cell) {
  var [cw,row,col] = cell.split('-');
  var cellAbove = getCellAbove(cell);
  return !isValidCell(cellAbove) || isBlankCell(cellAbove);
}

function firstCellOfDown(cell) {
  return nothingAboveMe(cell);
}

function startOfWord(cell) {
  return firstCellOfDown(cell) || firstCellOfAcross(cell);
}

function addWordDown(cell) {
  debugger;
}

function getCurrentStateAcross(cell) {
  var cells = [];
  var currentCell = cell;
  while(isValidCell(currentCell) && !isBlankCell(currentCell)) {
    cells.push(getContents(currentCell));
    currentCell = cell;
  }
  return cells;
}

function getPotentialWords(state) {
  debugger;
}

function addWordAcross(cell) {
  var currentState = getCurrentStateAcross(cell);
  var potentialWords = getPotentialWords(currentState);

  debugger;
}

var fullToMyRight = function (cell) {
  var full = !isEmpty(cell);
  function isFull(cell) {
    if (isEmpty(cell)) {
      return false;
    } else if (isBlankOrWall(cell)) {
      return full;
    }
    return full && isFull(getCellToRight(cell));
  }
  return full && isFull(getCellToRight(cell));
}

function alreadyFilled(cell) {
  return fullToMyRight(cell) && fullBelow(cell);
}

function addWords(cell) {
  debugger;
  if (alreadyFilled(cell)) {
    return true;
  } else {
    return addWordAcross(cell) && addWordDown(cell);
  }
}

function populate(cell) {
  var potentialWords = [];
  var success = true;

  if (startOfWord(cell)) {
    success = success && addWords(cell);
  }
  return success;
}

function getContents(cell) {
  return grid[cell];
}

function isEmpty(cell) {
  return getContents(cell) === '';
}

function start(cell) {
  var nextCell = findNextOpenSquare(cell);
  if (!nextCell) {
    console.log('fini');
  }
  if (populate(nextCell)) {
    start(nextCell);
  } else {
    console.log('back up...');
  }
}

// placeholder until we integrate with client-side
function fetchGrid() {
  return {
    'cw-1-1': 'blank',
    'cw-1-2': 'blank',
    'cw-1-3': 'h',
    'cw-1-4': 'i',
    'cw-2-1': 'blank',
    'cw-2-2': '',
    'cw-2-3': '',
    'cw-2-4': '',
    'cw-3-1': '',
    'cw-3-2': '',
    'cw-3-3': '',
    'cw-3-4': 'blank',
    'cw-4-1': '',
    'cw-4-2': '',
    'cw-4-3': 'blank',
    'cw-4-4': 'blank',
  }
}

var grid = fetchGrid();

// (function setup() {
//   init.buildDictionary();
//   solveIt();
// })();

module.exports = {
  start: start,
  fullToMyRight: fullToMyRight
};