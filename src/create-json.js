var jsonfile = require('jsonfile'),
    readline = require('readline');
var _ = require('lodash-node');
var fs = require('fs'),
    gfs = require('graceful-fs');
gfs.gracefulify(fs);
var cwDict = {};

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

function createJson(file, max_length) {
  var rd = readline.createInterface({
    input: fs.createReadStream(file),
    output: process.stdout,
    terminal: false
  });

  rd.on('line', function(word) {
    if (word.length > 1 && word.length <= max_length) {
      addToDictionary(word);
    }
  }).on('close', function() {
    file = file.substr(0, file.lastIndexOf(".")) + ".json";
    jsonfile.writeFile(file, cwDict, function (err) {
      console.error(err)
    });
  });
}

(function() {
  createJson('word_lists/words8.txt', 8);
})();
