class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  add(vec) {
    return new Vector(this.x + vec.x, this.y + vec.y);
  }

  equals(vec) {
    return this.x === vec.x && this.y === vec.y;
  }
}

class Block {
  constructor(position, letter) {
    this.position = position;
    this.letter = letter;
  }

  move(vec) {
    return new Block(this.position.add(vec), this.letter);
  }

  translate(vec) {
    return new Block(vec, this.letter);
  }
  
  equals(block) {
    return this.position.equals(block.position) && this.letter === block.letter;
  }
}

class Snake {
  constructor(blocks, color) {
    this.blocks = blocks;
    this.color = color;
  }

  move(vec) {
    let firstNewBlock = this.blocks[0].move(vec);
    for (let block of this.blocks) {
      if (block.position.equals(firstNewBlock.position)) {
        return this;
      }
    }

    let newBlocks = [firstNewBlock];
    for (let index = 1; index < this.blocks.length; index++) {
      let oldBlock = this.blocks[index - 1];
      let blockToTranslate = this.blocks[index];
      newBlocks.push(blockToTranslate.translate(oldBlock.position));
    }

    return new Snake(newBlocks, this.color);
  }

  getBlockIndexes(blocksToFind) {
    let blockIndexes = blocksToFind.map(absentBlock => {
      let foundBlock = this.blocks.find(b => b.equals(absentBlock));
      return this.blocks.indexOf(foundBlock);
    });
    return blockIndexes;
  }
}

class Word {
  constructor(blocks, absentBlockIndexes, color) {
    this.blocks = blocks;
    this.absentBlockIndexes = absentBlockIndexes;
    this.color = color;
  }

  complete(completionBlocks) {
    if (this.absentBlockIndexes.length == 0) {
      return false;
    }
    
    return this.getAbsentBlocks().every(b1 => completionBlocks.some(b2 => b2.equals(b1)));
  }

  intersect(block) {
    return this.getExistingBlocks().some(b => b.position.equals(block.position));
  }

  getAbsentBlocks() {
    return this.blocks.filter((_, blockIndex) => this.absentBlockIndexes.indexOf(blockIndex) >= 0);
  }

  getExistingBlocks() {
    return this.blocks.filter((_, blockIndex) => this.absentBlockIndexes.indexOf(blockIndex) < 0);
  }

  removeFromAbsent(blocks) {
    let newAbsentBlocks = this.getAbsentBlocks().filter(b1 => !blocks.some(b2 => b1.equals(b2)));
	  let newAbsentBlockIndexes = newAbsentBlocks.map(b => this.blocks.indexOf(b));
	
    return new Word(this.blocks, newAbsentBlockIndexes, this.color);
  }

  addToAbsent(blocksToAdd) {
    let newAbsentBlockIndexes = this.getExistingBlocks()
      .filter(b1 => blocksToAdd.some(b2 => b1.equals(b2)))
      .map(b => this.blocks.indexOf(b))
	    .concat(this.absentBlockIndexes);
	  
    return new Word(this.blocks, newAbsentBlockIndexes, this.color);
  }
}

class Border {
  constructor(color, line) {
    this.color = color;
    this.line = line;
  }

  getOcuppiedCells() {
    let cells = [this.line[0]]

    for (let point of this.line.slice(1, this.line.length)) {
      do {
        let previousCell = cells[cells.length - 1];
        
        var dx = previousCell.x - point.x;
        var dy = previousCell.y - point.y;
        
        let newCell = new Vector(previousCell.x - Math.sign(dx), previousCell.y - Math.sign(dy));
        cells.push(newCell);
      } while (dx != 0 || dy != 0);
    }
    
    return cells;
  }

  cross(vec) {
    return this.getOcuppiedCells().some(c => c.equals(vec));
  }

  checkInsideSegment(vec) {
    for(let pointIndex = 1; pointIndex < this.line.length; pointIndex++) {
      let point1 = this.line[pointIndex - 1];
      let point2 = this.line[pointIndex];
      
      let d = (point2.x - point1.x) * (vec.y - point1.y) - (vec.x - point1.x) * (point2.y - point1.y);

      if(d < 0) {
        return false;
      }
    }

    return true;
  }
}

function createWinningBorder(level) {
  function clamp(val, min, max) {
    if(val > max) {
      return max;
    } else if (val < min) {
      return min;
    }

    return val;
  }

  let allVecs = [];

  for(let word of level.words) {
    allVecs = allVecs.concat(word.blocks.map(b => b.position));
  }

  allVecs = allVecs.concat(level.snake.blocks.map(b => b.position));

  let mustLeft = allVecs.sort((a, b) => a.x - b.x)[0];
  let mustRight = allVecs.sort((a, b) => b.x - a.x)[0];
  let mustTop = allVecs.sort((a, b) => a.y - b.y)[0];
  let mustBottom = allVecs.sort((a, b) => b.y - a.y)[0];

  let line = [
    new Vector(mustLeft.x - 2, mustTop.y - 2), 
    new Vector(mustRight.x + 2, mustTop.y - 2), 
    new Vector(mustRight.x + 2, mustBottom.y + 2), 
    new Vector(mustLeft.x - 2, mustBottom.y + 2),      
    new Vector(mustLeft.x - 2, mustTop.y - 2)]
  .map(v => new Vector(
    clamp(v.x, 0, 25), 
    clamp(v.y, 0, 25)));

  return new Border(level.winningColor, line);
}

function loadLevel(num, snake) {
  let levelRawData = levels[num];
  let levelData = {};

  function mapVectors(vecs) {
    return vecs.map(mapVector);
  }

  function mapVector(vec) {
    return Object.assign(new Vector(), vec);
  }

  function mapBlocks(blocks) {
    return blocks.map(b => Object.assign(new Block(), b, {position: mapVector(b.position)}));
  }

  levelData.snake = snake || new Snake(mapBlocks(levelRawData.snake.blocks), levelRawData.snake.color);
  levelData.words = levelRawData.words.map(w => Object.assign(new Word(), w, {blocks: mapBlocks(w.blocks)}));
  levelData.borders = levelRawData.borders.map(b => Object.assign(new Border(), b, {line: mapVectors(b.line)}));
  levelData.winningColor = levelRawData.winningColor;
  levelData.num = num;

  if(!levelData.borders.find(b => b.color == levelData.winningColor) && num < 4) {
    levelData.borders.push(createWinningBorder(levelData));
  }
  
  return levelData;
}

function wordSnake() {
  let actions = {
    left: "left",
    right: "right",
    up: "up",
    down: "down",
    undo: "undo",
    active: []
  };

  let levelState = loadLevel(0);
  let renderedLevelState = null;
  let history = [];
  let canvasCtx = document.getElementById("canvas").getContext('2d');
  let controller = controllerGen(actions);

  function* controllerGen(actions) {
    function getAction() {
      return actions.active.length ? actions.active.reverse()[0] : null;
    }
    
    let idle = true;
    let actionStartTime = null;
    let lastActionTime = null;
    let actionStartDelay = 150;
    let delayBetweenActions = 50;

    while(true) {
      let currentTime = new Date().getTime();
      let timeFromLastAction = currentTime - lastActionTime; 
      let timeFromActionStart = currentTime - actionStartTime;
      let action = getAction();

      if(!action) {
        idle = true;
        yield null;
        continue;
      }

      if(idle) {
        idle = false;
        actionStartTime = currentTime;  
      } else if(
          timeFromActionStart < actionStartDelay || 
          timeFromLastAction < delayBetweenActions) {
        yield null;
        continue;
      }
      
      lastActionTime = currentTime;
      
      yield action;
    }
  }

  function getMoveVec(action) {
    switch(action) {
      case actions.left:
        return new Vector(-1, 0);
      case actions.up:
        return new Vector(0, -1);
      case actions.right:
        return new Vector(1, 0);
      case actions.down:
        return new Vector(0, 1);
    }
  }

  function updateLevel(level, action) {
    let backfallResult = level;
    let moveVec = getMoveVec(action);
  
    if(!moveVec) {
      return backfallResult;
    }
    
    let movedSnake = level.snake.move(moveVec);
    
    if(movedSnake == level.snake) {
      return backfallResult;
    }

    if(level.words.some(w => w.intersect(movedSnake.blocks[0]))) {
      return backfallResult;
    }

    if(level.borders.some(b => b.cross(movedSnake.blocks[0].position) &&  b.color != movedSnake.color)) {
      return backfallResult;
    }

    for(let word of level.words) {
      if(word.complete(movedSnake.blocks)){
        let newSnake = new Snake(word.blocks, word.color);
        let newWords = level.words.map(w => 
          w == word 
          ? new Word(
            movedSnake.blocks, 
            movedSnake.getBlockIndexes(word.getAbsentBlocks()), 
            movedSnake.color) 
          : w.removeFromAbsent(movedSnake.blocks)
             .addToAbsent(word.blocks)
        );
        
        return { ...level, snake: newSnake, words: newWords };
      }
    }
    
    return { ...level, snake: movedSnake };
  }

  function loadNextLevelOnVictory(level) {
    let winningBorder = level.borders.find(b => b.color == level.winningColor); 
    let victory = level.snake.color == winningBorder.color && level.snake.blocks.every(b => !winningBorder.checkInsideSegment(b.position));

    if(victory) {
      return loadLevel(level.num + 1, level.snake);
    } else {
      return level;
    }
  }

  function getActionByKeyCode(keyCode) {
    switch(keyCode) {
      case 37: // left
        return actions.left;
      case 38: // up
        return actions.up;
      case 39: // right      
        return actions.right;
      case 40: // down
        return actions.down;
      case 8: // backspace
        return actions.undo;
    }
  }

  document.addEventListener("keydown", e => {
    let action = getActionByKeyCode(e.keyCode);
    
    if(action && !actions.active.includes(action)) {
      actions.active.push(action);
    }
  });

  document.addEventListener("keyup", e => {    
    let action = getActionByKeyCode(e.keyCode);
    
    actions.active = actions.active.filter(a => a != action);
  });

  window.addEventListener("resize", e => {
    renderedLevelState = null;
  })

  window.setInterval(() => {
    let action = controller.next().value;
    
    if(action == actions.undo && history.length) {
      levelState = history.pop();
    } else {
      let newLevelState = updateLevel(levelState, action);

      if(newLevelState != levelState) {
        history.push(levelState);     

        levelState = newLevelState;
        levelState = loadNextLevelOnVictory(levelState);        
      }
    }
  }, 10);

  window.setInterval(function() {
    if(levelState != renderedLevelState) {
      let size = Math.min(window.innerWidth, window.innerHeight);
      let scale = size / 25; 

      canvasCtx.canvas.width  = size;
      canvasCtx.canvas.height = size;
      canvasCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      canvasCtx.font = scale + 'px "Fira Sans", sans-serif';
      
      for(let word of levelState.words) {        
        for(let blockIndex in word.blocks) {
          let block = word.blocks[blockIndex];        
          canvasCtx.fillStyle = word.absentBlockIndexes.includes(Number(blockIndex)) ? '#F5F5F5' : word.color;
          canvasCtx.fillText(block.letter, block.position.x * scale + scale / 6, block.position.y * scale + scale / 1.2);
        }
      }

      canvasCtx.fillStyle = levelState.snake.color;
      canvasCtx.strokeStyle = levelState.snake.color;
      
      for(let block of levelState.snake.blocks) {      
        canvasCtx.fillText(block.letter, block.position.x * scale + scale / 6, block.position.y * scale + scale / 1.2);
        canvasCtx.strokeRect(block.position.x * scale, block.position.y * scale, scale, scale);
        canvasCtx.fillRect(block.position.x * scale, block.position.y * scale + scale, scale, 2);
      }
      
      for(let border of levelState.borders) {
        canvasCtx.strokeStyle = border.color;
        canvasCtx.lineWidth = 2;
        canvasCtx.beginPath();
        canvasCtx.moveTo(border.line[0].x * scale + scale/2, border.line[0].y * scale + scale/2);

        for(let point of border.line.slice(1, border.line.length)) {
          canvasCtx.lineTo(point.x * scale + scale/2, point.y * scale + scale/2);
        }

        canvasCtx.stroke();
      }
      
      renderedLevelState = levelState;
    }
  }, 1);
}