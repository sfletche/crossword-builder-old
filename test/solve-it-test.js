var _ = require('lodash-node');
var solveIt = require('../src/solve-it.js');

var cwDict = {
  '2': {
    '1': {
      'a': ['aa', 'ab'],
      'b': ['ba'],
      'h': ['ha']
    },
    '2': {
      'a': ['aa', 'ba', 'ha'],
      'b': ['ab']
    }
  },
  '3': {
    '1': {
      'a': ['aaa', 'abs'],
      'b': ['bah'],
      'h': ['has']
    },
    '2': {
      'a': ['aaa', 'bah', 'has'],
      'b': ['abs']
    },
    '3': {
      'a': ['aaa'],
      'h': ['bah'],
      's': ['abs', 'has']
    }
  }
};

(function() {
  var state = ['h',''];
  var wordLists = solveIt.getWordLists(state, {cwDict});
  console.log('wordLists: ' + wordLists);
  console.log('length: ' + wordLists.length);
  console.log(wordLists[0]);
  console.log(wordLists[1]);
  console.log(wordLists[2]);
  console.log('intersection: ' + _.intersection(...wordLists));
})();
