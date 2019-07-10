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

      if(d <= 0) {
        return false;
      }
    }

    return true;
  }
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

  return levelData;
}

function wordSnake() {
  let currentLevelNum = 0;
  let levelState = loadLevel(currentLevelNum);
  let renderedLevelState = null;
  let scale = 20;
  let canvasCtx = document.getElementById("canvas").getContext('2d');
  let actions = {};
  let movement = movementGen(actions);

  function* movementGen(actions) {
    function getMoveVec() {
      if(actions.left) {
        return new Vector(-1, 0);
      }

      if(actions.up) {
        return new Vector(0, -1);
      }

      if(actions.right) {
        return new Vector(1, 0);
      }

      if(actions.down) {
        return new Vector(0, 1);
      }
    }
    
    let idle = true;
    let moveStartTime = null;
    let lastMoveTime = null;
    let moveStartDelay = 150;
    let delayBetweenMoves = 50;

    while(true) {
      let currentTime = new Date().getTime();
      let timeFromLastMove = currentTime - lastMoveTime; 
      let timeFromMoveStart = currentTime - moveStartTime;
      let moveVec = getMoveVec();

      if(!moveVec) {
        idle = true;
        yield null;
        continue;
      }

      if(idle) {
        idle = false;
        moveStartTime = currentTime;
      } else {
        if(timeFromMoveStart < moveStartDelay) {
          yield null;
          continue;
        }
    
        if(timeFromLastMove < delayBetweenMoves) {
          yield null;
          continue;
        }
      }

      lastMoveTime = currentTime;
      
      yield moveVec;
    }
  }

  function updateLevel(level, moveVec) {
    let backfallResult = level;
  
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
    let victory = level.snake.blocks.every(b => winningBorder.checkInsideSegment(b.position));

    if(victory) {
      return loadLevel(++currentLevelNum, level.snake);
    } else {
      return level;
    }
  }

  document.addEventListener("keydown", e => {
    switch(e.keyCode) {
      case 37: // left
        actions.left = true;
        break;
      case 38: // up
        actions.up = true;
        break;
      case 39: // right      
        actions.right = true;
        break;
      case 40: // down
        actions.down = true;
        break;
    }
  });

  document.addEventListener("keyup", e => {
    switch(e.keyCode) {
      case 37: // left
        actions.left = false;
        break;
      case 38: // up
        actions.up = false;
        break;
      case 39: // right      
        actions.right = false;
        break;
      case 40: // down
        actions.down = false;
        break;
    }
  });

  setInterval(() => {
    let moveVec = movement.next().value;
    levelState = updateLevel(levelState, moveVec);
    levelState = loadNextLevelOnVictory(levelState);
  }, 10);

  setInterval(function() {
    if(levelState != renderedLevelState) {
      canvasCtx.clearRect(0, 0, 500, 500);
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
        canvasCtx.beginPath();
        canvasCtx.moveTo(border.line[0].x * scale + scale/2, border.line[0].y * scale + scale/2);

        for(let point of border.line.slice(1, border.line.length)) {
          canvasCtx.lineTo(point.x * scale + scale/2, point.y * scale + scale/2);
        }

        canvasCtx.stroke();
      }
      
      renderedLevelState = levelState;
    }
  }, 10);
}