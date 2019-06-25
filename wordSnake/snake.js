function Vector(x, y) {
	this.x = x;
	this.y = y;
}

Vector.prototype.add = function(vec) {
	return new Vector(this.x + vec.x, this.y + vec.y)
}

Vector.prototype.equals = function(vec) {
	return this.x === vec.x && this.y === vec.y;
}

function Block(position, letter) {
	this.position = position;
	this.letter = letter;
}

Block.prototype.move = function(vec) {
	return new Block(this.position.add(vec), this.letter);
}

Block.prototype.translate = function(vec) {
	return new Block(vec, this.letter);
}

Block.prototype.equals = function(block) {
	return this.position.equals(block.position) && this.letter === block.letter;
}

function Snake (blocks, color) {	
	this.blocks = blocks;
	this.color = color;
}

Snake.prototype.move = function(vec){
	let firstNewBlock = this.blocks[0].move(vec);
	
	for(let block of this.blocks) {
		if(block.position.equals(firstNewBlock.position)) {
			return this;
		}
	}
	
	let newBlocks = [firstNewBlock];	
	for(let index = 1; index < this.blocks.length; index++) {
		let oldBlock = this.blocks[index - 1];
		let blockToTranslate = this.blocks[index];
		
		newBlocks.push(blockToTranslate.translate(oldBlock.position));
	}
	
	return new Snake(newBlocks, this.color);
};

Snake.prototype.createWord = function(absentBlocks) {
	var absentBlockIndexes = absentBlocks.map(absentBlock => {
		var newAbsentBlock = this.blocks.find(b => b.equals(absentBlock));
		
		return this.blocks.indexOf(newAbsentBlock);
	});
	
	return new Word(this.blocks, absentBlockIndexes, this.color);
}

function Word(blocks, absentBlockIndexes, color) {	
	this.blocks = blocks;
	this.absentBlockIndexes = absentBlockIndexes;
	this.color = color;
}

Word.prototype.createSnake = function(snakeBlocks) {
	if(this.absentBlockIndexes.length == 0) {
		return null;
	}
	
	for(let block of this.getAbsentBlocks()) {
		let blockFound = false;
		for(let snakeBlock of snakeBlocks) {
			if(snakeBlock.equals(block)) {
				blockFound = true;
				break;
			}
		}
		
		if(!blockFound) {
			return null;
		}
	}
	
	return new Snake(this.blocks, this.color);
};

Word.prototype.getAbsentBlocks = function() {
	return this.blocks.filter((_, blockIndex) => this.absentBlockIndexes.indexOf(blockIndex) >= 0);
}

Word.prototype.getExistingBlocks = function() {
	return this.blocks.filter((_, blockIndex) => this.absentBlockIndexes.indexOf(blockIndex) < 0);
}

function snakeGame() {	
	let snake = new Snake([
		new Block(new Vector(0, 0), 'g'),
		new Block(new Vector(0, 0), 'r'),
		new Block(new Vector(0, 0), 'e'),
		new Block(new Vector(0, 0), 'e'),
		new Block(new Vector(0, 0), 'n'),
	], 'green');
	
	let wordRed = new Word(
		[new Block(new Vector(5, 10), 'r'),
		 new Block(new Vector(6, 10), 'e'),
		 new Block(new Vector(7, 10), 'd')],
		[1],
		'red'
	);
	
	let wordNavy = new Word(
		[new Block(new Vector(10, 10), 'n'),
		 new Block(new Vector(10, 11), 'a'),
		 new Block(new Vector(10, 12), 'v'),
		 new Block(new Vector(10, 13), 'y')],
		[3],
		'#001f3f'
	);
	
	let xWord = new Word(
		[new Block(new Vector(5, 16), 'x')], [], 'black');
	
	let wordYellow = new Word(
		[new Block(new Vector(5, 15), 'y'),
		 new Block(new Vector(6, 15), 'e'),
		 new Block(new Vector(7, 15), 'l'),
		 new Block(new Vector(7, 16), 'l'),
		 new Block(new Vector(7, 17), 'o'),
		 new Block(new Vector(6, 17), 'w')],
		[1],
		'yellow'
	);
	
	let words = [wordRed, wordYellow, wordNavy, xWord];
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
			for(let word of words) {
				let newSnake = word.createSnake(snake.blocks);
				
				if(newSnake) {
					let newWords = words.map(w => {
						if(w == word) {
							return snake.createWord(word.getAbsentBlocks());
						}
						
						return w;
					});
					
					return {snake: newSnake, words: newWords};
				}
			}
			
			return {snake, words}
		}
		
		let moveVec = getMoveVec(e.keyCode);
		
		if(moveVec) {
			snake = snake.move(moveVec);
			({snake, words} = updateWordAndSnake(snake, words));			
		}
	});

	setInterval(function() {
		if(snake != previousSnake) {
			canvasCtx.clearRect(0, 0, 500, 500);
			canvasCtx.fillStyle = snake.color;
			canvasCtx.strokeStyle = snake.color;
			canvasCtx.font = scale + 'px "Fira Sans", sans-serif';
			
			for(let block of snake.blocks) {			
				canvasCtx.fillText(block.letter, block.position.x * scale + scale / 3.5, block.position.y * scale + scale / 1.3);
				canvasCtx.strokeRect(block.position.x * scale, block.position.y * scale, scale, scale);
			}
			
			for(let word of words) {				
				canvasCtx.fillStyle = word.color;
				for(let block of word.getExistingBlocks()) {				
					canvasCtx.fillText(block.letter, block.position.x * scale, block.position.y * scale + scale);
				}
			}
			
			previousSnake = snake;
		}
	}, 10);
}