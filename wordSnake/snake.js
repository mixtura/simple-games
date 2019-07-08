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

  cross(color, pos) {
    return this.color != color && this.getOcuppiedCells().some(cell => cell.equals(pos));
  }
}

function snakeGame() {  
  let snake = new Snake([
    new Block(new Vector(1, 1), 'G'),
    new Block(new Vector(2, 1), 'R'),
    new Block(new Vector(3, 1), 'E'),
    new Block(new Vector(4, 1), 'E'),
    new Block(new Vector(5, 1), 'N'),
  ], 'green');
  
  let wordRed = new Word(
    [new Block(new Vector(10, 15), 'R'),
     new Block(new Vector(11, 15), 'E'),
     new Block(new Vector(12, 15), 'D')],
    [1],
    'red'
  );
  
  let wordNavy = new Word(
    [new Block(new Vector(8, 9), 'N'),
     new Block(new Vector(8, 10), 'A'),
     new Block(new Vector(8, 11), 'V'),
     new Block(new Vector(8, 12), 'Y')],
    [3],
    '#001f3f'
  );
  
  let wordBlack = new Word(
    [new Block(new Vector(5, 11), 'B'),
     new Block(new Vector(5, 12), 'L'),
     new Block(new Vector(5, 13), 'A'),
     new Block(new Vector(5, 14), 'C'),
     new Block(new Vector(6, 14), 'K')    
    ], [1, 2], 'black');
  
  let wordYellow = new Word(
    [new Block(new Vector(5, 10), 'Y'),
     new Block(new Vector(6, 10), 'E'),
     new Block(new Vector(7, 10), 'L'),
     new Block(new Vector(7, 11), 'L'),
     new Block(new Vector(7, 12), 'O'),
     new Block(new Vector(6, 12), 'W')],
    [1],
    'yellow'
  );
  
  let wordBlue = new Word(
    [new Block(new Vector(20, 2), 'B'),
     new Block(new Vector(21, 2), 'L'),
     new Block(new Vector(22, 2), 'U'),
     new Block(new Vector(23, 2), 'E')],
    [0],
    'blue'  
  );
  
  let wordUltraviolet = new Word(
    [new Block(new Vector(18, 6), 'U'),
     new Block(new Vector(18, 5), 'L'),
     new Block(new Vector(18, 4), 'T'),
     new Block(new Vector(19, 4), 'R'),
     new Block(new Vector(20, 4), 'A'),
     new Block(new Vector(20, 5), 'V'),
     new Block(new Vector(20, 6), 'I'),
     new Block(new Vector(21, 6), 'O'),
     new Block(new Vector(22, 6), 'L'),
     new Block(new Vector(22, 5), 'E'),
     new Block(new Vector(22, 4), 'T')],
    [0, 4],
    '#7f1ae5'
  ); 

  let borderUltraviolet = new Border('#7f1ae5', [new Vector(0, 20), new Vector(24, 20)]);
  let borderPink = new Border('pink', [new Vector(0, 0), new Vector(24, 0), new Vector(24, 24), new Vector(0, 24), new Vector(0, 0)]);
  
  let borders = [borderUltraviolet, borderPink];
  let words = [wordRed, wordYellow, wordNavy, wordBlack, wordBlue, wordUltraviolet];
  let previousSnake = null;
  let scale = 20;
  let canvasCtx = document.getElementById("canvas").getContext('2d');

  document.addEventListener("keydown", e => {
    function getMoveVec(keyCode) {
      switch(keyCode) {
        case 37: // left
          return new Vector(-1, 0);
        case 38: // up
          return new Vector(0, -1);
        case 39: // right
          return new Vector(1, 0);
        case 40: // down
          return  new Vector(0, 1);
      }
    }
    
    function updateWordAndSnake(snake, words) {
      let backfallResult = {snake, words};
      let moveVec = getMoveVec(e.keyCode);
    
      if(!moveVec) {
        return backfallResult;
      }
      
      snake = snake.move(moveVec);
      
      if(words.some(w => w.intersect(snake.blocks[0]))) {
        return backfallResult;
      }

      if(borders.some(b => b.cross(snake.color, snake.blocks[0].position))) {
        return backfallResult;
      }

      for(let word of words) {
        if(word.complete(snake.blocks)){
          let newSnake = new Snake(word.blocks, word.color);
          let newWords = words.map(w => 
            w == word 
            ? new Word(
              snake.blocks, 
              snake.getBlockIndexes(word.getAbsentBlocks()), 
              snake.color) 
            : w.removeFromAbsent(snake.blocks)
               .addToAbsent(word.blocks)
          );
          
          return {snake: newSnake, words: newWords};
        }      
      }
      
      return {snake, words};
    }
    
    ({snake, words} = updateWordAndSnake(snake, words));
  });

  setInterval(function() {
    if(snake != previousSnake) {
      canvasCtx.clearRect(0, 0, 500, 500);
      canvasCtx.fillStyle = snake.color;
      canvasCtx.strokeStyle = snake.color;
      canvasCtx.font = scale + 'px "Fira Sans", sans-serif';
      
      for(let block of snake.blocks) {      
        canvasCtx.fillText(block.letter, block.position.x * scale + scale / 6, block.position.y * scale + scale / 1.2);
        canvasCtx.strokeRect(block.position.x * scale, block.position.y * scale, scale, scale);
        canvasCtx.fillRect(block.position.x * scale, block.position.y * scale + scale, scale, 2);
      }
      
      for(let word of words) {        
        canvasCtx.fillStyle = word.color;
        for(let block of word.getExistingBlocks()) {        
          canvasCtx.fillText(block.letter, block.position.x * scale, block.position.y * scale + scale);
        }
      }

      for(let border of borders) {
        canvasCtx.strokeStyle = border.color;
        canvasCtx.beginPath();
        canvasCtx.moveTo(border.line[0].x * scale + scale/2, border.line[0].y * scale + scale/2);

        for(let point of border.line.slice(1, border.line.length)) {
          canvasCtx.lineTo(point.x * scale + scale/2, point.y * scale + scale/2);
        }

        canvasCtx.closePath();
        canvasCtx.stroke();
      }
      
      previousSnake = snake;
    }
  }, 10);
}