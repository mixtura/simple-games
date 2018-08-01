function tetris(canvasId) {
	function checkVecsEqual(vec1, vec2) {
		return vec1.x == vec2.x && vec1.y == vec2.y;
	}
		
	function createVector(x, y) {
		return {x: x, y: y}
	}	
	
	function addVectors(vector1, vector2) {
		return {x : vector1.x + vector2.x, y: vector1.y + vector2.y}		
	}
	
	function rotateVector(vector, direction) {
		if(direction < 0) {
			return { x : -vector.y, y: vector.x };
		}
		
		return {x: -vector.x, y: vector.y};
	}
	
	function toLocalPosition(worldPosition, worldAnchorPosition) {
		return {x: worldPosition.x - worldAnchorPosition.x, y: worldPosition.y - worldAnchorPosition.y};
	}
	
	function toWorldPositon(localPosition, worldAnchorPosition) {
		return {x: localPosition.x + worldAnchorPosition.x, y: localPosition.y + worldAnchorPosition.y};
	}
	
	var colors = [
		[255, 255, 255],
		[255, 0, 255],
		[255, 255, 0],
		[0, 255, 255]
	]
		
	var directions = {
		right: createVector(1, 0),
		left: createVector(-1, 0),
		up: createVector(0, -1),
		down: createVector(0, 1)
	}
	
	var figureTypes = [
		{
			name: "S",
			data: [
				createVector(-1, 0),
				createVector(0, 0),
				createVector(0, 1),
				createVector(1, 1)
			]
		},
	
		{
			name: "I",
			data: [
				createVector(0, -1),
				createVector(0, 0),
				createVector(0, 1),
				createVector(0, 2)
			]
		},
		
		{
			disableRotate: true,
			name: "O", 
			data: [
				createVector(0, 0),
				createVector(0, 1),
				createVector(1, 1),
				createVector(1, 0)
			]
		},
		
		{
			name: "Z",
			data: [
				createVector(-1, 0),
				createVector(0, 0),
				createVector(0, -1),
				createVector(1, -1)
			]
		},
		
		{
			name: "L",
			data: [
				createVector(0, 0),
				createVector(0, -1),
				createVector(0, -2),
				createVector(1, 0)
			]
		}
	];
	
	function getRandEntry(arr) {
		var index = Math.floor( Math.random() * arr.length); 
		
		return arr[index];
	}
	
	function createFigure(gameField) {
		var rotationCount = Math.floor(Math.random() * 4);
		var figureType = getRandEntry(figureTypes);
		var color = getRandEntry(colors);
		
		var figure = {
			color: color,
			position: createVector(Math.floor(gameField.width / 2), 1),
			data: figureType.data.map(vec => createVector(vec.x, vec.y)),
			disableRotate: figureType.disableRotate
		};
		
		while(rotationCount) {
			figure = rotateFigure(gameField, figure, -1);
			rotationCount--;
		}
		
		return figure;		
	}
	
	function createGameField(width, height) {
		var gameField = {
			data: []
		};
		
		for(var y = 0; y < height; y++) {
			var line = new Array(width);			
			gameField.data.push(line);
		}
		
		gameField.loop = function(iter){
			for(var y=0; y < height; y++) {
				for(var x=0; x < width; x++) {
					var cell = this.data[y][x];
					
					iter(x, y, cell);
				}
			}
		}
		
		gameField.set = function(vec, color) {
			this.data[vec.y][vec.x] = color;
		}
		
		gameField.get = function(x, y) {
			if (x < 0 || y < 0 || x >= width || y >= height)
				return 1;
			
			return this.data[y][x];				
		}
		
		gameField.getLine = function(index) {
			return this.data[index];
		}
		
		gameField.setLine = function(index, line) {
			this.data[index] = line;
		}
		
		gameField.width = width;
		gameField.height = height;
		
		return gameField;
	}
	
	function moveFigure(gameField, figure, directionVec) {			
		var newPosition = addVectors(figure.position, directionVec);
		
		if(!checkBounderies(gameField, figure.data, newPosition)) {
			return figure;
		}
		
		return {
			...figure,
			position: newPosition,
		}
	}
	
	function rotateFigure(gameField, figure, direction) {	
		if(figure.disableRotate) {
			return figure;
		}
		
		var newData = figure.data.map(vec => rotateVector(vec, direction));

		if(!checkBounderies(gameField, newData, figure.position)) {
			return figure;
		}
		
		return {
			...figure,
			data: newData
		}
	}
	
	function checkBounderies(gameField, vecs, position) {
		for(var vec of vecs) {
			var worldPosition = toWorldPositon(vec, position);
			
			if(gameField.get(worldPosition.x, worldPosition.y)) {
				return false;
			}
		}
		
		return true;
	}
		
	function landFigure(gameField, figure) {
		for(var vec of figure.data) {
			var worldPosition = toWorldPositon(vec, figure.position);
			
			gameField.set(worldPosition, figure.color);
		}
	}
	
	function getLinesCompletion(gameField) {
		var linesCompletion = new Array(gameField.height);
		
		gameField.loop((x, y, cell) => {
			linesCompletion[y] = (linesCompletion[y] || 0);
			
			if(cell) {
				linesCompletion[y] = linesCompletion[y] + 1;
			}
		});
		
		return linesCompletion;
	}
	
	function removeCompletedLines(gameField, linesCompletion) {
		var newGameField = createGameField(gameField.width, gameField.height);
		var copyIndex = gameField.height - 1; 
		
		for(var lineIndex = linesCompletion.length - 1; lineIndex >= 0; lineIndex--) {
			var lineCompletion = linesCompletion[lineIndex];
			
			if(lineCompletion < gameField.width && lineCompletion > 0) {
				newGameField.setLine(copyIndex, gameField.getLine(lineIndex));
				copyIndex--;
			}
		}
		
		return newGameField;
	}
	
	function createInput(animationManager, speed, stickingDelay) {
		var toProcess = {};
		
		document.addEventListener("keydown", e => toProcess[e.key] = true);
		document.addEventListener("keyup", e => {
			toProcess[e.key] = false;
			animationManager.resetDelay(e.key);
		});

		return {
			processInput: function(map, config) {				
				var keys = Object.keys(toProcess).filter(key => toProcess[key]);

				for(var key of keys) {
					var action = map[key];
					
					if(action) {
						animationManager.animate(key, speed, () => {
							animationManager.delay(key, stickingDelay, () => {
								action();
								
								if(config && config.resetKeys) {
									for(var key of config.resetKeys) {
										toProcess[key] = false;
									}
								}
							});
						});
					}
				}				
			}
		};
	}
		
	function createAnimation(speed) {
		return {
			ticksPassed: 0,
			speed: speed,
			animate: function(func) {
				if(this.ticksPassed > Math.floor(1 / this.speed * 100)) {
					this.ticksPassed = 0;
					func();
				} else {
					this.ticksPassed++;					
				}
			}
		}
	}
	
	function createDelay(d) {
		return {
			ticksPassed: 0,
			delay: d,
			executeWithDelay: function(func) {
				if(this.ticksPassed > this.delay) {
					func();
				} else {
					this.ticksPassed++;
				}
			}
		}
	}
	
	function createAnimationManager() {
		return {	
			animations: {},
			delays: {},
			animate: function(key, speed, f) {
				if(this.animations[key]) {
					this.animations[key].animate(f);
				} else {
					this.animations[key] = createAnimation(speed);
				}
			},
			delay: function(key, d, f) {
				if(this.delays[key]) {
					this.delays[key].executeWithDelay(f);
				} else {
					this.delays[key] = createDelay(d, f);
					f();
				}
			},
			resetDelay: function(key) {
				this.delays[key] = null;
			}			
		};
	}
	
	function update(world, input, animationManager) {
		var ticksSinceLastFigureFall = world.ticksSinceLastFigureFall;
		var currentFigure = world.currentFigure;
		var gameField = world.gameField;
		
		input.processInput({
			ArrowLeft: () => currentFigure = moveFigure(gameField, currentFigure, directions.left),
			ArrowRight: () => currentFigure = moveFigure(gameField, currentFigure, directions.right),
			ArrowDown: () => currentFigure = moveFigure(gameField, currentFigure, directions.down),
			Enter: () => currentFigure = rotateFigure(gameField, currentFigure, -1)
		}, {resetKeys: ["Enter"]});
		
		animationManager.animate(
			"figureFall",
			world.speed,
			() => {
				var oldPosition = currentFigure.position;
				
				currentFigure = moveFigure(gameField, currentFigure, directions.down);
				
				if(checkVecsEqual(oldPosition, currentFigure.position)) {
					// do we need to create new instance of gameField here?
					landFigure(gameField, currentFigure);
					currentFigure = createFigure(gameField);
				}	
			});	
			
		var linesCompletion = getLinesCompletion(gameField);
		
		gameField = removeCompletedLines(gameField, linesCompletion);
		
		return {
			...world,
			ticksSinceLastFigureFall: ticksSinceLastFigureFall,
			currentFigure: currentFigure,	
			gameField: gameField,
		}
	}
	
	function createRenderCtx(canvasId) {
		var canvas = document.getElementById(canvasId);
		var ctx = canvas.getContext('2d');
		
		return ctx;
	}
	
	function render(world, ctx) {		
		var gameField = world.gameField;
		var figure = world.currentFigure;
				
		function flash() {
			ctx.fillStyle = 'rgb(0,0,0)';		
			ctx.fillRect(0, 0, 10 * world.gameField.width, 10 * world.gameField.height);				
		}
		
		function fillCell(x, y, color) {
			if(!color)
				return;
			
			ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
			ctx.fillRect(x * 10, y * 10, 10, 10);
		}
		
		flash();
		
		gameField.loop(fillCell);		
		
		for(var vec of figure.data) {
			var worldPosition = toWorldPositon(vec, figure.position);
			
			fillCell(worldPosition.x, worldPosition.y, figure.color);
		}
	}
	
	function createWorld(speed, width, height) {
		var gameField = createGameField(width, height);
		
		return {
			currentFigure: createFigure(gameField),
			gameField: gameField,
			speed: speed
		}
	}
		
	var renderCtx = createRenderCtx(canvasId);
	var animationManager = createAnimationManager();
	var input = createInput(animationManager, 20, 5);
	var world = createWorld(5, 15, 30);
	
	setInterval(function() {
		world = update(world, input, animationManager);
		render(world, renderCtx);
	}, 5);
}