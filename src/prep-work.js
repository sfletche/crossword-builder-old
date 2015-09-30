var MAX_WORD_LENGTH = 3;
var dictionary = undefined;
var storage = require('node-persist');
var fs = require('fs'),
    readline = require('readline');

var rd = readline.createInterface({
    input: fs.createReadStream('words.txt'),
    output: process.stdout,
    terminal: false
});

// function initializeDictionary() {
//   storage.initSync();
//   dictionary = {};
//   for (var i=2; i<=MAX_WORD_LENGTH; i++) {
//     dictionary[i] = {};
//     for (var j=1; j<=i; j++) {
//       dictionary[i][j] = {};
//     }
//   }
// }

function addToDictionary(word) {
  var newWord = word.toLowerCase();
  for (var i=1, len = word.length; i<=len; i++) {
    var filename = len + '-' + i + '-' + word[i-1];
    var wordList = storage.getItem(filename) || [];
    if (!wordList || wordList[wordList.length-1] !== newWord) {
      wordList.push(newWord);
    }
    storage.setItem(filename, wordList);
  }
}

(function buildDictionary() {
  // initializeDictionary();
  storage.initSync();
  rd.on('line', function(word) {
    if (word.length > 1 && word.length <= MAX_WORD_LENGTH) {
      addToDictionary(word);
    }
  }).on('close', function() {
    var out = storage.getItem('3-2-b');
    console.log(out);
  });
})();
