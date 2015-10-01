What's Next

Create small, 3x3 or 4x4, example and build out auto-fill from 3 letter words

Auto-fill
 - moving from top left to bottom right
 - checking each square, see if a word is needed across and down
  - is there a wall or black square to my left, then auto-fill across
  - is there a wall or black square to my top, then auto-fill down
  - auto-fill
   - get list of potential words
    - check for existing word (might be filled already)
    - check for existing letters (constraints on potential solution)
     - take intersection of word lists from existing letters and start there
    - if no existing letters than grab all words of desired length
   - try word from list of potential words
    - verify all new words created by entry are legit
    - if not, try next word in the list

NOTE: how to simulate a more random / less alphabetical result...?
 - solution 1: randomize the elements of each file after dictionary has been build out
 - solution 2: randomize the elements of potential words once that list is determined

Notepad to manage theme words
 - gray out when entered into grid?

Auto-Fill Option
 - using persistent storage, the app attempts to fill in the rest of the grid
  - include adding new black sqaures??? (would add complexity to algorithm...)
 - maybe create a list of words (eliminate the need to manuever around the grid while populating)?
  - how to manage characters that apply to multiple words?
  - might not work...
 - General Algorithm
  - find solution group for first word
  - use first word in solution group
  - find solution group for second word
  - use first word in solution group
  - if solution group is empty, back up to nearest non-empty solution group use next word
  - continue
 - Persistent Storage
  - length-position-letter

/usr/share/dict/words (about 10K words less than 10 characters)
'aa', 'ba', 'ab', 'ha'
'aaa', 'bah', 'abs', 'has'

Persistent storage
2-1-a: ['aa', 'ab']
2-1-b: ['ba']
2-1-h: ['ha']
2-2-a: ['aa', 'ba', 'ha']
2-2-b: ['ab']
...

Dictionary example - deprecated
{
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
}