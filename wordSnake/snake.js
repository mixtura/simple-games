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

Snake.prototype.getBlockIndexes = function(blocksToFind) {
	var blockIndexes = blocksToFind.map(absentBlock => {
		var foundBlock = this.blocks.find(b => b.equals(absentBlock));
		
		return this.blocks.indexOf(foundBlock);
	});
	
	return blockIndexes;
}

function Word(blocks, absentBlockIndexes, color) {	
	this.blocks = blocks;
	this.absentBlockIndexes = absentBlockIndexes;
	this.color = color;
}

Word.prototype.complete = function(completionBlocks) {
	if(this.absentBlockIndexes.length == 0) {
		return false;
	}
	
	return this.getAbsentBlocks().every(b1 => completionBlocks.some(b2 => b2.equals(b1)));
};

Word.prototype.intersect = function(blocks) {
	return this.getExistingBlocks().some(b1 => blocks.some(b2 => b1.position.equals(b2.position)));	
}

Word.prototype.getAbsentBlocks = function() {
	return this.blocks.filter((_, blockIndex) => this.absentBlockIndexes.indexOf(blockIndex) >= 0);
}

Word.prototype.getExistingBlocks = function() {
	return this.blocks.filter((_, blockIndex) => this.absentBlockIndexes.indexOf(blockIndex) < 0);
}

function snakeGame() {	
	let snake = new Snake([
		new Block(new Vector(0, 0), 'g'),
		new Block(new Vector(1, 0), 'r'),
		new Block(new Vector(2, 0), 'e'),
		new Block(new Vector(3, 0), 'e'),
		new Block(new Vector(4, 0), 'n'),
	], 'green');
	
	let wordRed = new Word(
		[new Block(new Vector(10, 15), 'r'),
		 new Block(new Vector(11, 15), 'e'),
		 new Block(new Vector(12, 15), 'd')],
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
		[new Block(new Vector(5, 11), 'b'),
		 new Block(new Vector(5, 12), 'l'),
		 new Block(new Vector(5, 13), 'a'),
		 new Block(new Vector(5, 14), 'c'),
		 new Block(new Vector(6, 14), 'k')		
		], [2], 'black');
	
	let wordYellow = new Word(
		[new Block(new Vector(5, 10), 'y'),
		 new Block(new Vector(6, 10), 'e'),
		 new Block(new Vector(7, 10), 'l'),
		 new Block(new Vector(7, 11), 'l'),
		 new Block(new Vector(7, 12), 'o'),
		 new Block(new Vector(6, 12), 'w')],
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
			let backfallResult = {snake, words};
			let moveVec = getMoveVec(e.keyCode);
		
			if(!moveVec) {
				return backfallResult;
			}
			
			snake = snake.move(moveVec);
			
			if(words.some(w => w.intersect(snake.blocks))) {
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
						: w
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
				canvasCtx.fillText(block.letter, block.position.x * scale + scale / 3.5, block.position.y * scale + scale / 1.2);
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