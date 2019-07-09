let editorMode = {
  none: 'none',
  wordEdit: 'wordEdit',
  snakeEdit: 'snakeEdit',
  borderEdit: 'borderEdit'
};

class Editor {
  constructor() {
    this.activeCell = new Vector(0, 0);
    this.words = [];
    this.wordCreationMode = false;
    this.blocks = [];
    this.wordAbsentIndexes = [];
    this.borders = [];
    this.borderLine = [];
    this.activeColor = 'red';
    this.activeMode = editorMode.none;
    this.snake = null;
  }

  removeLastEntity() {
    switch(this.activeMode) {
      case editorMode.wordEdit: 
      case editorMode.snakeEdit:
        this.removeLastWordBlock();
        break;
      case editorMode.borderEdit: 
        this.removeLastBorderPoint();
        break;
    }
  }

  createBorder() {
    let border = new Border(this.activeColor, this.borderLine);

    this.borders.push(border);
    this.borderLine = [];
  }

  removeLastBorderPoint() {
    this.borderLine.pop();
    
    if(this.borderLine.length != 0) {
      this.activeCell = this.borderLine[this.borderLine.length - 1];
    }
  }

  setBorderLinePoint() {
    if(this.activeMode != editorMode.borderEdit){
      return;
    }

    let existingPoint = this.borderLine.slice(1, this.borderLine.length - 1).find(p => p.equals(this.activeCell));    
    if(!existingPoint) {
      this.borderLine.push(this.activeCell);
    }
  }
  
  removeLastWordBlock() {
    let lastWordIndex = () => this.blocks.length - 1;

    this.blocks.splice(lastWordIndex(), 1);
    this.wordAbsentIndexes = this.wordAbsentIndexes.filter(i => i != lastWordIndex());

    if(this.blocks.length != 0) {
      this.activeCell = this.blocks[lastWordIndex()].position;
    }
  }

  toggleAbsent() {
    if(this.activeMode != editorMode.wordEdit){
      return;
    }

    let currentBlockIndex = this.blocks.findIndex(b => b.position.equals(this.activeCell));
    
    if(currentBlockIndex >= 0) {
      if(this.wordAbsentIndexes.includes(currentBlockIndex)) {
        this.wordAbsentIndexes = this.wordAbsentIndexes.filter(i => i != currentBlockIndex);
      } else {
        this.wordAbsentIndexes.push(currentBlockIndex);
      }
    }
  }

  setBlock(letter) {
    if(this.activeMode != editorMode.wordEdit && this.activeMode != editorMode.snakeEdit){
      return;
    }

    let existingBlockIndex = this.blocks.findIndex(b => b.position.equals(this.activeCell));
    let newBlock = new Block(this.activeCell, letter);
    
    if(existingBlockIndex >= 0) {
      this.blocks[existingBlockIndex] = newBlock;
    } else {
      this.blocks.push(newBlock);
    }
  }

  enableDefaultMode() {
    if(this.activeMode == editorMode.none) {
      return;
    }
    
    this.save();

    this.activeMode = editorMode.none;
  }

  enableBorderEdit() {    
    if(this.activeMode == editorMode.borderEdit) {
      return;
    }

    this.save();

    this.activeMode = editorMode.borderEdit;
  }

  enableWordEdit() {    
    if(this.activeMode == editorMode.wordEdit) {
      return;
    }

    this.save();
    this.activeMode = editorMode.wordEdit;
    
    let existingWord = this.words.find(w => w.blocks.some(b => b.position.equals(this.activeCell)));
    
    if(existingWord != null) {
      this.words = this.words.filter(w => w != existingWord);
      this.blocks = existingWord.blocks;
      this.wordAbsentIndexes = existingWord.absentBlockIndexes;
      this.activeColor = existingWord.color;
    }
  }

  enableSnakeEdit() {
    if(this.activeMode == editorMode.snakeEdit) {
      return;
    }
    
    this.save();
    this.activeMode = editorMode.snakeEdit;

    if(this.snake != null) {
      this.blocks = this.snake.blocks;
      this.activeColor = this.snake.color;
      this.activeCell = this.snake.blocks[0].position;
    }
  }

  save() {    
    if(this.blocks.length) {
      if(this.activeMode == editorMode.wordEdit) {
        this.words.push(new Word(this.blocks, this.wordAbsentIndexes, this.activeColor));
      } 
      
      if(this.activeMode == editorMode.snakeEdit) {
        this.snake = new Snake(this.blocks, this.activeColor);
      }

      this.blocks = [];
      this.wordAbsentIndexes = [];
    }

    if(this.borderLine.length) {
      this.borders.push(new Border(this.activeColor, this.borderLine));
      this.borderLine = [];
    }
  }

  movePointerLeft() {
    this.activeCell = this.guardDesiredActiveCell(this.activeCell.add(new Vector(-1, 0)));
  }

  movePointerRight() {
    this.activeCell = this.guardDesiredActiveCell(this.activeCell.add(new Vector(1, 0)));
  }
  
  movePointerUp() {
    this.activeCell = this.guardDesiredActiveCell(this.activeCell.add(new Vector(0, -1)));
  }
  
  movePointerDown() {
    this.activeCell = this.guardDesiredActiveCell(this.activeCell.add(new Vector(0, 1)));
  }

  guardDesiredActiveCell(desiredPos) {
    if(this.activeMode == editorMode.wordEdit || this.activeMode == editorMode.snakeEdit) {      
      let block = this.blocks.find(b => b.position.equals(desiredPos));
      let activeCellIsTail = this.blocks[this.blocks.length - 1].position.equals(this.activeCell);
      
      return block || activeCellIsTail ? desiredPos : this.activeCell;
    }

    if(this.activeMode == editorMode.borderEdit && this.borderLine.length != 0) {      
      let lastPoint = this.borderLine[this.borderLine.length - 1];
      if(lastPoint.x - desiredPos.x != 0 && lastPoint.y - desiredPos.y != 0) {
        return this.activeCell;
      }
    }

    return desiredPos;
  }

  serializeLevel() {
    let levelData = {
      snake: this.snake,
      words: this.words,
      borders: this.borders
    };

    return JSON.stringify(levelData);
  }
}

function wordSnakeEditor() {
  let editor = new Editor(); 
  let scale = 20;
  let canvasCtx = document.getElementById("canvas").getContext('2d');
  let activeColorInputs = document.getElementsByName("activeColor");
  let needRedraw = true;

  activeColorInputs.forEach(el => {
    el.addEventListener("change", e => {
      needRedraw = true;
      editor.activeColor = e.target.value;
      activeColorInputs.forEach(el => el.setAttribute("value", e.target.value));
      e.target.blur();
    });
  });

  document.addEventListener("keydown", e => {
    needRedraw = true;
    
    switch(e.keyCode) {
      case 37: // left
        editor.movePointerLeft();
        break;
      case 38: // up
        editor.movePointerUp();
        break;
      case 39: // right
        editor.movePointerRight();
        break;
      case 40: // down
        editor.movePointerDown();
        break;
      case 49: // 1
        editor.enableDefaultMode();
        break;
      case 50: // 2
        editor.enableWordEdit();
        break;        
      case 51: // 3
        editor.enableSnakeEdit();
        break;        
      case 52: // 4
        editor.enableBorderEdit();
        break;
      case 13: // enter
        editor.setBorderLinePoint();
        break;
      case 8: // backspace
        editor.removeLastEntity();
        break;
      case 32: // space
        editor.toggleAbsent();
        break;
      default:
        if(e.keyCode >= 65 && e.keyCode <= 90) {
          editor.setBlock(e.key.toUpperCase(), false);
        }
    }
  });

  // Rendering shit
  window.setInterval(function() {
    if(!needRedraw) {
      return;
    }

    // flash
    canvasCtx.clearRect(0, 0, 500, 500);
    canvasCtx.font = scale + 'px "Fira Sans", sans-serif';
    
    // saved snake
    if(editor.snake) {
      canvasCtx.fillStyle = editor.snake.color;
      canvasCtx.strokeStyle = editor.snake.color;
      for(let block of editor.snake.blocks) {
        canvasCtx.strokeRect(block.position.x * scale, block.position.y * scale, scale, scale);
        canvasCtx.fillText(block.letter, block.position.x * scale, block.position.y * scale + scale);
      }
    }

    // saved words
    for(let word of editor.words) {
      for(let blockIndex in word.blocks) {
        let block = word.blocks[blockIndex];
        let isAbsent = word.absentBlockIndexes.includes(Number(blockIndex));
        
        canvasCtx.fillStyle = isAbsent ? 'gray' : word.color;
        canvasCtx.fillText(block.letter, block.position.x * scale, block.position.y * scale + scale);
      }
    }

    // saved borders
    for(let border of editor.borders) {
      canvasCtx.strokeStyle = border.color;
      canvasCtx.beginPath();
      canvasCtx.moveTo(border.line[0].x * scale + scale/2, border.line[0].y * scale + scale/2);

      for(let point of border.line.slice(1, border.line.length)) {
        canvasCtx.lineTo(point.x * scale + scale/2, point.y * scale + scale/2);
      }

      canvasCtx.stroke();
    }

    // current blocks
    for(let blockIndex in editor.blocks) {
      let block = editor.blocks[blockIndex];
      let isAbsent = editor.wordAbsentIndexes.includes(Number(blockIndex));

      canvasCtx.fillStyle = isAbsent ? 'gray' : editor.activeColor;
      canvasCtx.fillText(block.letter, block.position.x * scale, block.position.y * scale + scale);
    }
    
    // current border points
    for(let point of editor.borderLine) {
      canvasCtx.beginPath();
      canvasCtx.arc(point.x * scale + scale/2, point.y * scale + scale/2, scale/4, 0, Math.PI * 2);
      canvasCtx.stroke();
    }

    // current border line
    if(editor.borderLine.length > 0) {
      canvasCtx.strokeStyle = editor.activeColor;
      canvasCtx.beginPath();
      canvasCtx.moveTo(editor.borderLine[0].x * scale + scale/2, editor.borderLine[0].y * scale + scale/2);

      for(let point of editor.borderLine.slice(1, editor.borderLine.length)) {
        canvasCtx.lineTo(point.x * scale + scale/2, point.y * scale + scale/2);
      }

      canvasCtx.stroke();
    }
    
    // pointer style
    switch(editor.activeMode) {
      case editorMode.wordEdit:
        canvasCtx.strokeStyle = 'red';
        break;
      case editorMode.snakeEdit:
        canvasCtx.strokeStyle = 'green';
        break;
      case editorMode.borderEdit:
        canvasCtx.fillStyle = 'red';
        break;
      default:
        canvasCtx.strokeStyle = 'gray';
    }

    // pointer
    if(editor.activeMode != editorMode.borderEdit) {
      canvasCtx.strokeRect(editor.activeCell.x * scale, editor.activeCell.y * scale, scale, scale);
    } else {
      canvasCtx.beginPath();
      canvasCtx.arc(editor.activeCell.x * scale + scale/2, editor.activeCell.y * scale + scale/2, scale/4, 0, Math.PI * 2);
      canvasCtx.closePath();
      canvasCtx.fill();
    }

    document.getElementById("levelData").innerText = editor.serializeLevel();

    needRedraw = false;
  }, 100);
}