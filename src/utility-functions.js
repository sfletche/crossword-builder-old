
const NUM_ROWS = 4;
const NUM_COLS = 4;

var isValidCell = function(cell) {
  return cell &&
         cell.row >= 0 && cell.row <= NUM_ROWS &&
         cell.col >= 0 && coll.col <= NUM_COLS;
};

var getAdjacentCell = function(cell) {
  console.log('getAdjacentCell');
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
};


var fullToMyRight = function (cell) {
  console.log('fullToMyRight');
  console.log(cell);
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
};

var fullBelow = function (cell) {
  console.log('fullBelow');
  console.log(cell);
  var full = !isEmpty(cell);
  function isFull(cell) {
    if (isEmpty(cell)) {
      return false;
    } else if (isBlankOrWall(cell)) {
      return full;
    }
    return full && isFull(getCellBelow(cell));
  }
  return full && isFull(getCellBelow(cell));
};


var startOfWord = function(cell) {
  console.log('startOfWord');
  console.log('first cell of down: ' + firstCellOfDown(cell));
  console.log('first cell of across: ' + firstCellOfAcross(cell));
  return firstCellOfDown(cell) || firstCellOfAcross(cell);
};

var isBlankCell = function(cell) {
  return getContents(cell) === 'blank';
};

var isEmpty = function(cell) {
  return getContents(cell) === '';
};

var getContents = function(cell) {
  return grid[cell];
};


function nothingToMyLeft(cell) {
  var [cw,row,col] = cell.split('-');
  var cellToLeft = getCellToLeft(cell);
  return isBlankOrWall(cellToLeft);
}

function nothingAboveMe(cell) {
  var [cw,row,col] = cell.split('-');
  var cellAbove = getCellAbove(cell);
  return !isValidCell(cellAbove) || isBlankCell(cellAbove);
}

function firstCellOfDown(cell) {
  return nothingAboveMe(cell);
}

function firstCellOfAcross(cell) {
  return nothingToMyLeft(cell);
}

function isBlankOrWall(cell) {
  return !isValidCell(cell) || isBlankCell(cell);
}

function getCellAbove(cell) {
  var [cw,row,col] = cell.split('-');
  return [cw, row-1, col].join('-');
}

function getCellToRight(cell) {
  var [cw,row,col] = cell.split('-');
  return [cw, row, col+1].join('-');
}

function getCellBelow(cell) {
  var [cw,row,col] = cell.split('-');
  return [cw, row+1, col].join('-');
}

function getCellToLeft(cell) {
  var [cw,row,col] = cell.split('-');
  return [cw, row, col-1].join('-');
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


module.exports = {
  fullToMyRight: fullToMyRight,
  fullBelow: fullBelow,
  startOfWord: startOfWord,
  isBlankCell: isBlankCell,
  isValidCell: isValidCell,
  isEmpty: isEmpty,
  getAdjacentCell: getAdjacentCell,
  getContents: getContents
};