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

function addWordAcross(cell) {

}

function addwordDown(cell) {

}

function populate(cell) {
  var potentialWords = [];
  var success = true;

  // if (across(cell)) {
  //   success = success && addWordAcross(cell);
  // }
  // if (down(cell)) {
  //   success = success && addWordDown(cell);
  // }
  // return success;
}

function isEmpty(cell) {
  return grid[cell] === '';
}

function start(cell) {
  var nextCell = findNextOpenSquare(cell);
  if (!nextCell) {
    console.log('fini');
  }
  if (!isEmpty(nextCell)) {
    start(nextCell);
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

function solveIt() {
  var origin = 'cw-1-0';
  console.log('finding solution...');
  start(origin);
}

var grid = fetchGrid();

(function setup() {
  init.buildDictionary();
  solveIt();
})();