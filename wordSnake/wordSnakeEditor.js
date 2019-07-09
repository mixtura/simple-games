let editorMode = {
  none: 'none',
  wordEdit: 'wordEdit',
  borderEdit: 'borderEdit'
};

class Editor {
  constructor() {
    this.activeCell = new Vector(0, 0);
    this.words = [];
    this.wordCreationMode = false;
    this.wordBlocks = [];
    this.wordAbsentIndexes = [];
    this.borders = [];
    this.borderLine = [];
    this.activeColor = 'red';
    this.activeMode = editorMode.none;
  }

  removeLastEntity() {
    switch(this.activeMode) {
      case editorMode.wordEdit: 
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
    if(this.activeMode != editorMode.borderEdit){
      return;
    }

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
    if(this.activeMode != editorMode.wordEdit){
      return;
    }

    let lastWordIndex = () => this.wordBlocks.length - 1;

    this.wordBlocks.splice(lastWordIndex(), 1);
    this.wordAbsentIndexes = this.wordAbsentIndexes.filter(i => i != lastWordIndex());

    if(this.wordBlocks.length != 0) {
      this.activeCell = this.wordBlocks[lastWordIndex()].position;
    }
  }

  toggleAbsent() {
    if(this.activeMode != editorMode.wordEdit){
      return;
    }

    let currentBlockIndex = this.wordBlocks.findIndex(b => b.position.equals(this.activeCell));
    
    if(currentBlockIndex >= 0) {
      if(this.wordAbsentIndexes.includes(currentBlockIndex)) {
        this.wordAbsentIndexes = this.wordAbsentIndexes.filter(i => i != currentBlockIndex);
      } else {
        this.wordAbsentIndexes.push(currentBlockIndex);
      }
    }
  }

  setBlock(letter) {
    if(this.activeMode != editorMode.wordEdit){
      return;
    }

    let existingBlockIndex = this.wordBlocks.findIndex(b => b.position.equals(this.activeCell));
    let newBlock = new Block(this.activeCell, letter);
    
    if(existingBlockIndex >= 0) {
      this.wordBlocks[existingBlockIndex] = newBlock;
    } else {
      this.wordBlocks.push(newBlock);
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
      this.wordBlocks = existingWord.blocks;
      this.wordAbsentIndexes = existingWord.absentBlockIndexes;
      this.activeColor = existingWord.color;
    }
  }

  save() {    
    if(this.wordBlocks.length) {
      this.words.push(new Word(this.wordBlocks, this.wordAbsentIndexes, this.activeColor));
      this.wordBlocks = [];
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
    if(this.activeMode == editorMode.wordEdit) {      
      let block = this.wordBlocks.find(b => b.position.equals(desiredPos));
      let activeCellIsTail = this.wordBlocks[this.wordBlocks.length - 1].position.equals(this.activeCell);
      
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
  let needRedraw = true;

  document.getElementsByName("activeColor").forEach(el => {
    el.addEventListener("change", e => {
      needRedraw = true;
      editor.activeColor = e.target.value;
      document.getElementsByName("activeColor").forEach(el => el.setAttribute("value", e.target.value));
      e.target.blur();
    });
  })

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

  window.setInterval(function() {
    if(!needRedraw) {
      return;
    }
    
    canvasCtx.clearRect(0, 0, 500, 500);
    canvasCtx.font = scale + 'px "Fira Sans", sans-serif';
    canvasCtx.strokeStyle = editor.activeMode == editorMode.none ? 'gray' : 'red';

    if(editor.activeMode == editorMode.wordEdit || editor.activeMode == editorMode.none) {
      canvasCtx.strokeRect(editor.activeCell.x * scale, editor.activeCell.y * scale, scale, scale);
    } else {
      canvasCtx.beginPath();
      canvasCtx.arc(editor.activeCell.x * scale + scale/2, editor.activeCell.y * scale + scale/2, scale/4, 0, Math.PI * 2);
      canvasCtx.closePath();
      canvasCtx.fill();
    }

    for(let word of editor.words) {
      for(let blockIndex in word.blocks) {
        let block = word.blocks[blockIndex];
        let isAbsent = word.absentBlockIndexes.includes(Number(blockIndex));
        
        canvasCtx.fillStyle = isAbsent ? 'gray' : word.color;
        canvasCtx.fillText(block.letter, block.position.x * scale, block.position.y * scale + scale);
      }
    }

    for(let border of editor.borders) {
      canvasCtx.strokeStyle = border.color;
      canvasCtx.beginPath();
      canvasCtx.moveTo(border.line[0].x * scale + scale/2, border.line[0].y * scale + scale/2);

      for(let point of border.line.slice(1, border.line.length)) {
        canvasCtx.lineTo(point.x * scale + scale/2, point.y * scale + scale/2);
      }

      canvasCtx.stroke();
    }

    if(editor.activeMode == editorMode.wordEdit) {
      for(let blockIndex in editor.wordBlocks) {
        let block = editor.wordBlocks[blockIndex];
        let isAbsent = editor.wordAbsentIndexes.includes(Number(blockIndex));

        canvasCtx.fillStyle = isAbsent ? 'gray' : editor.activeColor;
        canvasCtx.fillText(block.letter, block.position.x * scale, block.position.y * scale + scale);
      }
    }
    
    for(let point of editor.borderLine) {
      canvasCtx.beginPath();
      canvasCtx.arc(point.x * scale + scale/2, point.y * scale + scale/2, scale/4, 0, Math.PI * 2);
      canvasCtx.stroke();
    }

    if(editor.activeMode == editorMode.borderEdit && editor.borderLine.length > 0) {
      canvasCtx.strokeStyle = editor.activeColor;
      canvasCtx.beginPath();
      canvasCtx.moveTo(editor.borderLine[0].x * scale + scale/2, editor.borderLine[0].y * scale + scale/2);

      for(let point of editor.borderLine.slice(1, editor.borderLine.length)) {
        canvasCtx.lineTo(point.x * scale + scale/2, point.y * scale + scale/2);
      }

      canvasCtx.stroke();
    }

    document.getElementById("levelData").innerText = editor.serializeLevel();

    needRedraw = false;
  }, 100)
}