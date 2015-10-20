var MAX_WORD_LENGTH = 3;
// var dictionary = undefined;
// var client = require('node-persist');

// var redis = require("redis"),
var promiseFactory = require("q").Promise,
    redis = require('promise-redis')(promiseFactory),
    client = redis.createClient();
var fs = require('fs'),
    gfs = require('graceful-fs'),
    readline = require('readline');

gfs.gracefulify(fs);

var rd = readline.createInterface({
    input: fs.createReadStream('words.txt'),
    output: process.stdout,
    terminal: false
});

// function initializeDictionary() {
//   client.initSync();
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
    var filename = 'cw:' + len + ':' + i + ':' + word[i-1];
    // var wordList = client.get(filename) || [];
    // if (!wordList || wordList[wordList.length-1] !== newWord) {
    //   wordList.push(newWord);
    // }
    client.rpush(filename, newWord);
  }
}

function buildDictionary() {
  // initializeDictionary();
  // client.initSync();
  client.keys('cw:*', function(err, key) {
    client.del(key);
  });
  rd.on('line', function(word) {
    if (word.length > 1 && word.length <= MAX_WORD_LENGTH) {
      addToDictionary(word);
    }
  }).on('close', function() {
    var out = client.get('cw:3:2:b');
    // console.log(out);
  });
};

module.exports = {
  MAX_WORD_LENGTH: MAX_WORD_LENGTH,
  client: client,
  buildDictionary: buildDictionary
};
