// original prototype http://codepen.io/anon/pen/GpNrmO

const NUM_ROWS = 4;
const NUM_COLS = 4;

var Crossword = React.createClass({
  render: function() {
    var rows = [];
    for (var r = 0; r < NUM_ROWS; r++) {
      let row = [];
      rows.push(<div></div>);
      for (var c = 0; c < NUM_COLS; c++) {
        let id = `cw-${r}-${c}`;
        row.push(<input type='text' id={id} maxlength='1' />);
      }
      rows.push(row);
    }
    return (
      <div className='cw-grid'>
        {rows}
      </div>
    );
  }
});

var Notepad = React.createClass({
  render: function() {
    return (
      <div className='cw-notepad'>
        <input id='notepad' type='text' />
      </div>
    )
  }
});

React.render(
  <Crossword />,
  document.body
);

var inputList = [].slice.call(document.querySelectorAll("input"));

inputList.map(function(element) {
  element.addEventListener('keyup', function(e) {
    var keyCode = e.keyCode;
    if (!isSpacebar(keyCode) && !isArrow(keyCode) && !isLetter(keyCode)) {
      return;
    }
    var activeBox = document.activeElement;
    if (isLeftArrow(keyCode)) {
      moveLeft(activeBox);
    } else if (isUpArrow(keyCode)) {
      moveUp(activeBox);
    } else if (isRightArrow(keyCode)) {
      moveRight(activeBox);
    } else if (isDownArrow(keyCode)) {
      moveDown(activeBox);
    } else if (isSpacebar(keyCode)) {
      toggleBackground(activeBox);
    } else if (activeBox.value.length >= 1) {
      // getNextBox(activeBox).focus();
      restoreBackground(activeBox)
      activeBox.select();
    }
  })
});

function isArrow(keyCode) {
  return keyCode >= 37 && keyCode <= 40;
}

function isLeftArrow(keyCode) {
  return keyCode === 37;
}

function isUpArrow(keyCode) {
  return keyCode === 38;
}

function isRightArrow(keyCode) {
  return keyCode === 39;
}

function isDownArrow(keyCode) {
  return keyCode === 40;
}

function isLetter(keyCode) {
  return keyCode >= 65 && keyCode <= 90;
}

function isSpacebar(keyCode) {
  return keyCode === 32;
}

function toggleBackground(activeBox) {
  var element = document.getElementById(activeBox.id),
      opposingElement = getOpposingElement(element);
  if (backgroundIsBlack(element)) {
    element.style.background = 'white';
    opposingElement.style.background = 'white';
  } else {
    element.style.background = 'black';
    opposingElement.style.background = 'black';
  }
  element.select();
}

function getOpposingElement(element) {
  return document.getElementById(getOpposingId(element.id));
}

function getOpposingId(id) {
  var [cw,row,col] = id.split('-');
  col = NUM_COLS - parseInt(col,10) - 1;
  row = NUM_ROWS - parseInt(row,10) - 1;
  return [cw, row, col].join('-');
}

function backgroundIsBlack(element) {
  return element.style.background === 'black';
}

function restoreBackground(activeBox) {
  var element = document.getElementById(activeBox.id);
  element.style.background = 'white';
  restoreOpposingSquare(element);
}

function restoreOpposingSquare(element) {
  var id = getOpposingId(element.id);
  var element = document.getElementById(id);
  element.style.background = 'white';
}

function getNextBox(activeBox) {
  return document.getElementById(getNextBoxId(activeBox.id));
}

function moveLeft(activeBox) {
  var element = document.getElementById(getLeftBoxId(activeBox.id));
  element.focus();
  element.select();
  //restoreBackground(element);
}

function moveUp(activeBox) {
  var element = document.getElementById(getUpBoxId(activeBox.id));
  element.focus();
  element.select();
  //restoreBackground(element);
}

function moveRight(activeBox) {
  var element = document.getElementById(getRightBoxId(activeBox.id));
  element.focus();
  element.select();
  //restoreBackground(element);
}

function moveDown(activeBox) {
  var element = document.getElementById(getDownBoxId(activeBox.id));
  element.focus();
  element.select();
  //restoreBackground(element);
}

function getLeftBoxId(currentId) {
  var [cw,row,col] = currentId.split('-');
  col = parseInt(col,10) - 1;
  col = col < 0 ? NUM_COLS-1 : col;
  return [cw, row, col].join('-');
}

function getUpBoxId(currentId) {
  var [cw,row,col] = currentId.split('-');
  row = parseInt(row,10) - 1;
  row = row < 0 ? NUM_ROWS-1 : row;
  return [cw, row, col].join('-');
}

function getRightBoxId(currentId) {
  var [cw,row,col] = currentId.split('-');
  col = parseInt(col,10) + 1;
  col = col > NUM_COLS-1 ? 0 : col;
  return [cw, row, col].join('-');
}

function getDownBoxId(currentId) {
  var [cw,row,col] = currentId.split('-');
  row = parseInt(row,10) + 1;
  row = row > NUM_ROWS-1 ? 0 : row;
  return [cw, row, col].join('-');
}

function getNextBoxId(currentId) {
  var [cw,row,col] = currentId.split('-');
  row = parseInt(row,10);
  col = parseInt(col,10);
  col += 1;
  row = col > NUM_COLS-1 ? row + 1 : row;
  col = col > NUM_COLS-1 ? 0 : col;
  row = row > NUM_ROWS-1 ? 0 : row;
  return [cw, row, col].join('-');
}

// module.exports = {
//   fetchGrid: function() {
//     var grid = {};
//     for (var i=1; i<=NUM_ROWS; i++) {
//       for (var j=1; j<= NUM_COLS; j++) {
//         let id = `cw-${r}-${c}`;
//         let element = document.getElementById(activeBox.id);
//         if (backgroundIsBlack(element)) {
//           grid[id] = 'blank';
//         } else {
//           grid[id] = element.value;
//         }
//       }
//     }
//     return grid;
//   }
// };