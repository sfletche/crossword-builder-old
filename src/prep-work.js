var _ = require('lodash-node');
var cwDict = {};
var MAX_WORD_LENGTH = 4;

var fs = require('fs'),
    gfs = require('graceful-fs'),
    readline = require('readline');

gfs.gracefulify(fs);

var rd = readline.createInterface({
    input: fs.createReadStream('words.txt'),
    output: process.stdout,
    terminal: false
});

function addToDictionary(word) {
  var newWord = word.toLowerCase(),
      len = newWord.length;
  cwDict[len] = cwDict[len] || {};

  for (var i=1; i<=len; i++) {
    cwDict[len][i] = cwDict[len][i] || {};
    cwDict[len][i][newWord[i-1]] = cwDict[len][i][newWord[i-1]] || [];
    cwDict[len][i][newWord[i-1]].push(newWord);
    cwDict[len][i][newWord[i-1]] = _.uniq(cwDict[len][i][newWord[i-1]]);
  }
}

module.exports = {
  MAX_WORD_LENGTH,
  rd,
  cwDict,
  addToDictionary
};
