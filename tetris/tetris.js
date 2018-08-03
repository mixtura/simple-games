let Vector2 = (function() {
  function Vector2(x, y) {
    this.x = x;
    this.y = y;
  }

  Vector2.prototype.add = function(vector) {
    return new Vector2(this.x + vector.x, this.y + vector.y);    
  };
  
  Vector2.prototype.rotate = function(angle) {
    angle = angle % 4; 
    
    switch(angle) {
      case 1:
      case -3: 
        return new Vector2(-this.x, this.y);        
      case -1:
      case 3:
        return new Vector2(-this.y, this.x);        
      case 2:
      case -2:
        return new Vector2(this.x, -this.y);        
      default:
        return this;
    }
  };
  
  Vector2.equal = function(vec1, vec2) {
    return vec1.x == vec2.x && vec1.y == vec2.y;
  };

  Vector2.directions = {
    right: new Vector2(1, 0),
    left: new Vector2(-1, 0),
    up: new Vector2(0, -1),
    down: new Vector2(0, 1)
  };

  return Vector2;
})();

let GameField = (function() {  
  function GameField() {
    var args = Array.prototype.slice.call(arguments);

    if(args.length == 1) {
      if(!Array.isArray(args[0]) && !Array.isArray(args[0][0])) {
        throw "In case of single argument, it needs to be 2-dimension array.";
      }

      this.data = args[0];
      this.width = this.data[0].length;
      this.height = this.data.length;
      
      return this;
    }

    if(args.length == 2) {
      this.width = args[0];
      this.height = args[1];
      this.data = [];

      for(let y = 0; y < this.height; y++) {
        let line = new Array(this.width);      
        this.data.push(line);
      }

      return this;
    }

    throw "Wrong arguments.";
  }
  
  GameField.prototype.copy = function() {
    var newData = this.data.map(line => line.slice());
    var newGameField = new GameField(newData);
    
    return newGameField;
  }

  GameField.prototype.hit = function(vecs) {
    return vecs.some(vec => vec.x < 0 || vec.y < 0 || vec.x >= this.width || vec.y >= this.height || !!this.get(vec));      
  };

  GameField.prototype.set = function(vec, color) {
    this.data[vec.y][vec.x] = color;
  };

  GameField.prototype.get = function(vec) {        
    return this.data[vec.y][vec.x];        
  };

  GameField.prototype.getLine = function(index) {
    return this.data[index];
  };

  GameField.prototype.setLine = function(index, line) {
    this.data[index] = line.slice();
  };

  GameField.prototype.loop = function(iter) {
    for(let y = 0; y < this.height; y++) {
      for(let x = 0; x < this.width; x++) {
        let cell = this.data[y][x];
        
        iter(x, y, cell);
      }
    }
  };

  return GameField;
})();

let GameWorld = (function() {
  function GameWorld(gameField, figure, speed) {
    this.gameField = gameField;
    this.figure = figure;
    this.speed = speed;

    this.oldGameField = this.gameField;
    this.oldFigure = this.figure;
  }

  GameWorld.prototype.needRedraw = function() {
    return this.oldGameField != this.gameField || this.oldFigure != this.figure;  
  }

  GameWorld.prototype.createNew = function(gameField, figure, speed) {
    var oldGameField = this.gameField;
    var oldFigure = this.figure;

    var gameWorld = new GameWorld(gameField, figure, speed);

    gameWorld.oldGameField = oldGameField;
    gameWorld.oldFigure = oldFigure;

    return gameWorld;
  }

  return GameWorld;
})();

let Figure = (function() {
  const colors = [
    [255, 255, 255],
    [255, 0, 255],
    [255, 255, 0],
    [0, 255, 255]
  ];

  const figureTypes = [
    {
      name: "S",
      data: [
        new Vector2(-1, 0),
        new Vector2(0, 0),
        new Vector2(0, 1),
        new Vector2(1, 1)
      ]
    },
  
    {
      name: "I",
      data: [
        new Vector2(0, -1),
        new Vector2(0, 0),
        new Vector2(0, 1),
        new Vector2(0, 2)
      ]
    },
    
    {
      disableRotation: true,
      name: "O", 
      data: [
        new Vector2(0, 0),
        new Vector2(0, 1),
        new Vector2(1, 1),
        new Vector2(1, 0)
      ]
    },
    
    {
      name: "Z",
      data: [
        new Vector2(-1, 0),
        new Vector2(0, 0),
        new Vector2(0, -1),
        new Vector2(1, -1)
      ]
    },
    
    {
      name: "L",
      data: [
        new Vector2(0, 0),
        new Vector2(0, -1),
        new Vector2(0, -2),
        new Vector2(1, 0)
      ]
    }
  ];
  
  function getRandEntry(arr) {
    let index = Math.floor(Math.random() * arr.length);
    return arr[index];
  }

  function Figure(position, color, data, disableRotation) {
    this.position = position;
    this.color = color;
    this.data = data;
    this.disableRotation = disableRotation;
  }

  Figure.createRandom = function(gameField) {
    let angle = Math.floor(Math.random() * 4);
    let color = getRandEntry(colors);
    let type = getRandEntry(figureTypes);
    let position = new Vector2(Math.floor(gameField.width / 2), 1);
    let data = type.data.map(vec => new Vector2(vec.x, vec.y));
    let figure = new Figure(position, color, data, type.disableRotation);
    
    return figure.rotate(gameField, angle);
  }

  Figure.prototype.move = function(directionVec) {      
    let newPosition = this.position.add(directionVec);

    return new Figure(newPosition, this.color, this.data, this.disableRotation);
  }
  
  Figure.prototype.rotate = function(gameField, angle) {  
    if(this.disableRotation) {
      return this;
    }
    
    let newData = this.data.map(vec => vec.rotate(angle));

    return new Figure(this.position, this.color, newData, this.disableRotation);
  }

  Figure.prototype.getWorldData = function() {
    return this.data.map(vec => vec.add(this.position));
  }

  return Figure;
})();

function tetris(canvas) {
  function landFigure(gameField, figure) {    
    gameField = gameField.copy();

    for(let vec of figure.data) {
      let worldPosition = vec.add(figure.position);
      
      gameField.set(worldPosition, figure.color);
    }

    return gameField;
  }
  
  function getLinesCompletion(gameField) {
    let linesCompletion = new Array(gameField.height);
    
    gameField.loop((_, lineIndex, cell) => {
      linesCompletion[lineIndex] = (linesCompletion[lineIndex] || 0);
      
      if(cell) {
        linesCompletion[lineIndex] = linesCompletion[lineIndex] + 1;
      }
    });
    
    return linesCompletion;
  }
  
  function removeCompletedLines(linesCompletion, gameField) {
    let newGameField = new GameField(gameField.width, gameField.height);
    let copyIndex = gameField.height - 1; 
    
    for(let lineIndex = linesCompletion.length - 1; lineIndex >= 0; lineIndex--) {
      let lineCompletion = linesCompletion[lineIndex];
      
      if(lineCompletion < gameField.width && lineCompletion > 0) {
        newGameField.setLine(copyIndex, gameField.getLine(lineIndex));
        copyIndex--;
      }
    }
    
    return newGameField;
  }
  
  function createInputProcessor(delayer, delay) {
    let toProcess = {};

    document.addEventListener("keydown", e => toProcess[e.key] = true);
    document.addEventListener("keyup", e => toProcess[e.key] = false);

    return {
      process: function(map, config = {}) {        
        let actions = Object
          .keys(toProcess)
          .filter(key => toProcess[key] && map[key])
          .map(key => ({
            key: key,
            action: map[key],
            abort: (config.abortKeys || []).includes(key)
          }));

        actions.forEach(({key, action, abort}) => 
          delayer.delay(key, delay, () => {
            action();
            toProcess[key] = !abort;
          })
        );
      }
    };
  }

  function createDelayer() {
    let delays = {};

    function executeWithDelay(delay, f) {
      if(delay.ticksPassed > delay.delayVal) {
        delay.ticksPassed = 0;
        f();
      } else {
        delay.ticksPassed++;
      }
    }

    return {
      delay: function(key, delayVal, f) {
        if(delays[key]) {
          executeWithDelay(delays[key], f);
        } else {
          delays[key] = {
            ticksPassed: 0,
            delayVal: delayVal 
          };
  
          f();
        }
      }
    };
  }

  function move(gameField, figure, direction) {
    let movedFigure = figure.move(direction);

    return gameField.hit(movedFigure.getWorldData()) ? figure : movedFigure;
  }

  function rotate(gameField, figure, angle) {
    let rotatedFigure = figure.rotate(angle);

    return gameField.hit(rotatedFigure.getWorldData()) ? figure : rotatedFigure;
  }

  function update(world, input, delayer) {
    let currentFigure = world.figure;
    let gameField = world.gameField;
    
    input.process({
      ArrowLeft: () => currentFigure = move(gameField, currentFigure, Vector2.directions.left),
      ArrowRight: () => currentFigure = move(gameField, currentFigure, Vector2.directions.right),
      ArrowDown: () => currentFigure = move(gameField, currentFigure, Vector2.directions.down),
      Enter: () => currentFigure = rotate(gameField, currentFigure, -1)
    }, {abortKeys: ["Enter", "ArrowLeft", "ArrowRight"]});
    
    delayer.delay("figureFall", Math.floor(100 / world.speed),
      () => {
        let movedFigure = move(gameField, currentFigure, Vector2.directions.down);
        
        if(currentFigure == movedFigure) {
          if(gameField.hit(currentFigure.getWorldData())) {
            console.log("game over");
            return;
          }

          gameField = landFigure(gameField, currentFigure);
          currentFigure = Figure.createRandom(gameField);
        } else {
          currentFigure = movedFigure;
        }
      });

    let linesCompletion = getLinesCompletion(gameField);

    if(linesCompletion.some(completion => completion == gameField.width)) {
      gameField = removeCompletedLines(linesCompletion, gameField);
    }

    return world.createNew(gameField, currentFigure, world.speed);
  }
    
  function render(world, ctx) {   
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    
    let gameField = world.gameField;
    let figure = world.figure;

    let multiplayer = Math.floor(ctx.canvas.height / gameField.height);
    let shift = (ctx.canvas.width - multiplayer * gameField.width) / 2;
    
    function fillCell(x, y, color) {
      if(!color)
        return;
      
      ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
      ctx.fillRect(x * multiplayer + shift, y * multiplayer, multiplayer, multiplayer);
    }
    
    ctx.fillStyle = 'rgb(0,0,0)';    
    ctx.fillRect(shift, 0, multiplayer * world.gameField.width, multiplayer * world.gameField.height);

    gameField.loop(fillCell); 
    
    figure.data.forEach(vec => {
      let worldPosition = vec.add(figure.position); 
      fillCell(worldPosition.x, worldPosition.y, figure.color);
    });
  }

  function createWorld() {
    let gameField = new GameField(15, 30);
    let figure = Figure.createRandom(gameField);
    
    return new GameWorld(gameField, figure, 1);
  }

  let renderCtx = canvas.getContext('2d');
  let delayer = createDelayer();
  let input = createInputProcessor(delayer, 5);
  let world = createWorld();
  
  setInterval(function() {
    world = update(world, input, delayer);
  }, 5);

  setInterval(function() {
    if(world.needRedraw()) {
      render(world, renderCtx);
    }
  }, 1);
}