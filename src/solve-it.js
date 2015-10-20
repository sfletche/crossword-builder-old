require("babel/polyfill");
var _ = require('lodash-node');
var prep = require('./prep-work.js'),
    buildDictionary = prep.buildDictionary,
    client = prep.client;
var utility = require('./utility-functions.js'),
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
  while(isValidCell(currentCell) && !isBlankCell(currentCell)) {
    cells.push(getContents(currentCell));
    currentCell = getCellToRight(currentCell);
  }
  return cells;
}

function compileWordLists(err, data) {
  console.log('compileWordLists');
  console.log(data);
}

function getQuote() {
  var quote;

  return new Promise(function(resolve, reject) {
    // setTimeout(function() {
    quote = 'success';
    resolve(quote);
    // }, 10);
  });
}


async function testAsync(state) {
  var key = 'cw:3:1:h';
  // console.log('key: ' + key);
  // return new Promise(function(resolve, reject) {
  // var response = await client.get(key);
  var quote = await getQuote();
  console.log('quote in testAsync ' + quote);
  return quote;
}

function testingTheTest() {
  var quote = testAsync();
  console.log('quote in testingTheTest ', quote);
  return quote;
}

function getWordLists(state) {
  console.log('getWordLists');
  var wordLists = [];
  for (let i=0; i<state.length; i++) {
    if (state[i] !== '') {
      let key = 'cw:' + state.length + ':';
      key += (parseInt(i, 10)+1) + ':';
      key += state[i];
      console.log('key: ' + key);
      /***
      NEXT STEPS
      redis promise library
      accumulate promises and return (with all?)
      catching function will need to wait before proceeding...

      ***/
      client.lpop(key)
        .then(console.log)
        .catch(console.log);
    }
  }
  return wordLists;
}

function getPotentialWords(state) {
  console.log('getPotentialWords');
  var wordLists = getWordLists(state);
  console.log(wordLists);
  /***
  NEXT STEPS
  intersection will be run once promises are resolved
  ***/
  var words = _.intersection(...wordLists);
  return words;
}

function addWordAcross(cell) {
  console.log('addWordAcross');
  var currentState = getCurrentStateAcross(cell);
  var potentialWords = getPotentialWords(currentState);
  /***
  NEXT STEPS
  adding new words will have to wait for promises in getWordList to resolve...
  ***/
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
  /***
  NEXT STEPS
  across work will need to complete before down work is started
  ***/
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

  /***
  NEXT STEPS
  addWords might return a promise...
  populate could return a related promise...
  ***/
  if (startOfWord(cell)) {
    success = success && addWords(cell);
  }
  return success;
}

var loop = 1;

function start(cell) {
  // var nextCell = findNextOpenSquare(cell);
  buildDictionary();
  console.log('start');
  console.log(cell);
  if (!cell) {
    console.log('fini');
  }
  /***
  NEXT STEPS
  populate returns promise
  control flow (start or backup) is determined by outcome of promise
  ***/
  populate(cell)
    .then(start(findNextSquare(cell)))
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
  start: start,
  getWordLists: getWordLists,
  testAsync: testAsync,
  testingTheTest: testingTheTest
};