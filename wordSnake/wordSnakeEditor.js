let editorMode = {
  none: 'none',
  wordEdit: 'wordEdit',
  snakeEdit: 'snakeEdit',
  borderEdit: 'borderEdit',
  levelBorderEdit: 'borderEdit.level' 
};

class Editor {
  constructor() {
    this.activeCell = new Vector(0, 0);
    this.words = [];
    this.wordCreationMode = false;
    this.blocks = [];
    this.wordAbsentIndexes = [];
    this.borders = [];
    this.levelBorderLine = [];
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
      case editorMode.levelBorderEdit:
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
    if(!this.activeMode.startsWith("borderEdit")){
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
    
    /*
    let existingBorder = this.borders.find(b => b.getOcuppiedCells().some(v => v.equals(this.activeCell)));

    if(existingBorder != null) {
      this.borders = this.borders.filter(b => b != existingBorder);
      this.line = existingBorder.line;
      this.activeColor = existingBorder.color;
    }
    */
  }
 
  enableLevelBorderEdit() {
    if(this.activeMode == editorMode.levelBorderEdit) {
      return;
    }

    this.save();

    this.activeMode = editorMode.levelBorderEdit;

    if(this.levelBorderLine.length) {
      this.activeCell = this.levelBorderLine[0];
      this.borderLine = this.levelBorderLine;
    }
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
    function addItem(parent, index, name) {
      let node = document.createElement("li")

      node.innerHTML = "<li index=" + index  + "><input type='checkbox' checked />" + name + "</li>";

      parent.append(node);
    }

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
      if(this.activeMode == editorMode.borderEdit) {
        this.borders.push(new Border(this.activeColor, this.borderLine));
      }

      if(this.activeMode == editorMode.levelBorderEdit) {
        this.levelBorderLine = this.borderLine;
      }

      this.borderLine = [];
    }
    
    let wordsList = document.getElementById("words");    
    let bordersList = document.getElementById("borders");
      
    bordersList.innerHTML = '';
    wordsList.innerHTML = '';

    for(let index in this.borders) {
      addItem(bordersList, index, this.borders[index].color);
    }

    for(let index in this.words) {
      addItem(wordsList, index, this.words[index].blocks.reduce((acc, b) => acc + b.letter, ""));
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
    function getActiveItemIndexes(itemName) {
      return Array
        .from(document.getElementById(itemName).querySelectorAll('li'))
        .filter(e => e.getElementsByTagName("input")[0].checked)
        .map(e => Number(e.getAttribute("index")));
    }

    let shownBorders = getActiveItemIndexes("borders");
    let shownWords = getActiveItemIndexes("words");
    
    let levelData = {
      snake: this.snake,
      words: this.words.filter((_, index) => shownWords.includes(index)),
      borders: this.borders.filter((_, index) => shownBorders.includes(index)),
      levelBorderLine: this.levelBorderLine
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
      case 53: // 5
        editor.enableLevelBorderEdit();
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
        } else {
          return;
        }
    }

    needRedraw = true;
  });

  document.getElementById("levelData").addEventListener("change", function(el) {    
    editor.enableDefaultMode();

    let levelData = mapLevelData(JSON.parse(el.target.value));

    editor.words = levelData.words;
    editor.borders = levelData.borders;
    editor.snake = levelData.snake;
    editor.levelBorderLine = levelData.levelBorderLine;

    editor.save();

    needRedraw = true;
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

    // saved level border line
    if(editor.levelBorderLine.length) {
      canvasCtx.beginPath();
      canvasCtx.moveTo(editor.levelBorderLine[0].x * scale + scale/2, editor.levelBorderLine[0].y * scale + scale/2);
      
      for(let point of editor.levelBorderLine.slice(1, editor.levelBorderLine.length)) {
        canvasCtx.lineTo(point.x * scale + scale/2, point.y * scale + scale/2);
      }

      canvasCtx.setLineDash([4, 2]);
      canvasCtx.strokeStyle = "gold";      
      canvasCtx.stroke();    
      canvasCtx.setLineDash([]);
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
    
      case editorMode.levelBorderEdit:
        canvasCtx.fillStyle = 'gold';
        break;
      default:
        canvasCtx.strokeStyle = 'gray';
    }

    // pointer
    if(!editor.activeMode.startsWith("borderEdit")) {
      canvasCtx.strokeRect(editor.activeCell.x * scale, editor.activeCell.y * scale, scale, scale);
    } else {
      canvasCtx.beginPath();
      canvasCtx.arc(editor.activeCell.x * scale + scale/2, editor.activeCell.y * scale + scale/2, scale/4, 0, Math.PI * 2);
      canvasCtx.closePath();
      canvasCtx.fill();
    }

    document.getElementById("levelData").value = editor.serializeLevel();

    needRedraw = false;
  }, 100);
}