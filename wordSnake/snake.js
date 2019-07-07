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

Word.prototype.removeFromAbsent = function(blocks) {
	var newAbsentBlocks = this.getAbsentBlocks().filter(b1 => !blocks.some(b2 => b1.equals(b2)));
	var newAbsentBlockIndexes = newAbsentBlocks.map(b => this.blocks.indexOf(b));
	
	return new Word(this.blocks, newAbsentBlockIndexes, this.color);
}

Word.prototype.addToAbsent = function(blocksToAdd) {
	var newAbsentBlockIndexes = this.getExistingBlocks()
		.filter(b1 => blocksToAdd.some(b2 => b1.equals(b2)))
		.map(b => this.blocks.indexOf(b))
		.concat(this.absentBlockIndexes);
		
	return new Word(this.blocks, newAbsentBlockIndexes, this.color);
}

function Border(color, line) {
	this.color = color;
	this.line = line;
}

Border.prototype.getOcuppiedCells = function() {
	var cells = [];
	
	cells.push(this.line[0]);

	for(var point of this.line.splice(1)) {
		do {
			var previousCell = cells[cells.length - 1];
			var dx = previousCell.x - point.x;
			var dy = previousCell.y - point.y;

			var newCell = new Vector(
				previousCell.x + Math.sign(dx), 
				previousCell.y + Math.sign(dy));

			cells.push(newCell);
						
		} while(dx != 0 && dy != 0)
	}
}

Border.prototype.cross = function(color) {
	return this.color == color;
}

function snakeGame() {	
	let snake = new Snake([
		new Block(new Vector(0, 0), 'G'),
		new Block(new Vector(1, 0), 'R'),
		new Block(new Vector(2, 0), 'E'),
		new Block(new Vector(3, 0), 'E'),
		new Block(new Vector(4, 0), 'N'),
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
			
			previousSnake = snake;
		}
	}, 10);
}