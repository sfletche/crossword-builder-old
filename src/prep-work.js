var MAX_WORD_LENGTH = 4;
var dictionary = undefined;
// var storage = require('node-persist');
var fs = require('fs'),
    readline = require('readline');

var rd = readline.createInterface({
    input: fs.createReadStream('words.txt'),
    output: process.stdout,
    terminal: false
});

function initializeDictionary() {
  // storage.initSync();
  dictionary = {};
  for (var i=2; i<=MAX_WORD_LENGTH; i++) {
    dictionary[i] = {};
    for (var j=1; j<=i; j++) {
      dictionary[i][j] = {};
    }
  }
}

function addToDictionary(word) {
  var newWord = word.toLowerCase();
  for (var i=1, len = word.length; i<=len; i++) {
    var wordList = dictionary[len][i][word[i-1]];
    if (!wordList) {
      dictionary[len][i][word[i-1]] = wordList = [];
    }
    if (!wordList.length || wordList[wordList.length-1] !== newWord) {
      wordList.push(newWord);
    }
    // storage.setItem(len + '-' + i + '-' + word[i-1]);
  }
}

(function buildDictionary() {
  initializeDictionary();
  rd.on('line', function(word) {
    if (word.length > 1) {
      addToDictionary(word);
    }
  }).on('close', function() {
    // var out = storage.getItem('2-2-a');
    // console.log(out);
    console.log(dictionary['2']['2']['a']);
  });
})();
