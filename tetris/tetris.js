function tetris(canvasId) {
  let Vector = {
    equal: function(vec1, vec2) {
      return vec1.x == vec2.x && vec1.y == vec2.y;
    },
      
    create: function(x, y) {
      return {x: x, y: y}
    }, 
    
    add: function(vector1, vector2) {
      return {x : vector1.x + vector2.x, y: vector1.y + vector2.y}    
    },
    
    rotate: function(vector, direction) {
      if(direction < 0) {
        return { x : -vector.y, y: vector.x };
      }
      
      return {x: -vector.x, y: vector.y};
    }
  };

  Vector.directions = {
    right: Vector.create(1, 0),
    left: Vector.create(-1, 0),
    up: Vector.create(0, -1),
    down: Vector.create(0, 1)
  };
  
  let colors = [
    [255, 255, 255],
    [255, 0, 255],
    [255, 255, 0],
    [0, 255, 255]
  ];

  let figureTypes = [
    {
      name: "S",
      data: [
        Vector.create(-1, 0),
        Vector.create(0, 0),
        Vector.create(0, 1),
        Vector.create(1, 1)
      ]
    },
  
    {
      name: "I",
      data: [
        Vector.create(0, -1),
        Vector.create(0, 0),
        Vector.create(0, 1),
        Vector.create(0, 2)
      ]
    },
    
    {
      disableRotate: true,
      name: "O", 
      data: [
        Vector.create(0, 0),
        Vector.create(0, 1),
        Vector.create(1, 1),
        Vector.create(1, 0)
      ]
    },
    
    {
      name: "Z",
      data: [
        Vector.create(-1, 0),
        Vector.create(0, 0),
        Vector.create(0, -1),
        Vector.create(1, -1)
      ]
    },
    
    {
      name: "L",
      data: [
        Vector.create(0, 0),
        Vector.create(0, -1),
        Vector.create(0, -2),
        Vector.create(1, 0)
      ]
    }
  ];
  
  function getRandEntry(arr) {
    let index = Math.floor(Math.random() * arr.length);
    return arr[index];
  }
  
  function createFigure(gameField) {
    let rotationCount = Math.floor(Math.random() * 4);
    let figureType = getRandEntry(figureTypes);
    let color = getRandEntry(colors);
    
    let figure = {
      color: color,
      position: Vector.create(Math.floor(gameField.width / 2), 1),
      data: figureType.data.map(vec => Vector.create(vec.x, vec.y)),
      disableRotate: figureType.disableRotate
    };
    
    while(rotationCount--) {
      figure = rotateFigure(gameField, figure, -1);
    }
    
    return figure;    
  }
  
  function createGameField(width, height) {
    let gameField = {
      data: [],
      width: width,
      height: height,
      set: function(vec, color) {
        this.data[vec.y][vec.x] = color;
      },      
      get: function(x, y) {
        if (x < 0 || y < 0 || x >= width || y >= height)
          return 1;
        
        return this.data[y][x];        
      },      
      getLine: function(index) {
        return this.data[index];
      },      
      setLine: function(index, line) {
        this.data[index] = line;
      },
      loop: function(iter){
        for(let y = 0; y < height; y++) {
          for(let x = 0; x < width; x++) {
            let cell = this.data[y][x];
            
            iter(x, y, cell);
          }
        }
      }
    };
    
    for(let y = 0; y < height; y++) {
      let line = new Array(width);      
      gameField.data.push(line);
    }

    return gameField;
  }
  
  function moveFigure(gameField, figure, directionVec) {      
    let newPosition = Vector.add(figure.position, directionVec);
    
    if(crossBounderies(gameField, figure.data, newPosition)) {
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
    
    let newData = figure.data.map(vec => Vector.rotate(vec, direction));

    if(crossBounderies(gameField, newData, figure.position)) {
      return figure;
    }
    
    return {
      ...figure,
      data: newData
    }
  }
  
  function crossBounderies(gameField, vecs, position) {
    for(let vec of vecs) {
      let worldPosition = Vector.add(vec, position);
      
      if(gameField.get(worldPosition.x, worldPosition.y)) {
        return true;
      }
    }
    
    return false;
  }

  function landFigure(gameField, figure) {
    for(let vec of figure.data) {
      let worldPosition = Vector.add(vec, figure.position);
      
      gameField.set(worldPosition, figure.color);
    }
  }
  
  function getLinesCompletion(gameField) {
    let linesCompletion = new Array(gameField.height);
    
    gameField.loop((x, y, cell) => {
      linesCompletion[y] = (linesCompletion[y] || 0);
      
      if(cell) {
        linesCompletion[y] = linesCompletion[y] + 1;
      }
    });
    
    return linesCompletion;
  }
  
  function removeCompletedLines(gameField) {
    let linesCompletion = getLinesCompletion(gameField);
    let newGameField = createGameField(gameField.width, gameField.height);
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
  
  function createInput(animationManager, speed) {
    let toProcess = {};

    document.addEventListener("keydown", e => toProcess[e.key] = true);
    document.addEventListener("keyup", e => toProcess[e.key] = false);

    return {
      processInput: function(map, config = {}) {        
        let actions = Object.keys(toProcess).filter(key => toProcess[key] && map[key]).map(key => ({
          key: key,
          action: map[key],
          abort: (config.abortKeys || []).includes(key)
        }));

        actions.forEach(({key, action, abort}) => 
          animationManager.animate(key, speed, () => {
            action();
            toProcess[key] = !abort;
        }));
      }
    };
  }
    
  function createAnimationManager() {
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
    
    return {  
      animations: {},
      animate: function(key, speed, f) {
        if(this.animations[key]) {
          this.animations[key].animate(f);
        } else {
          this.animations[key] = createAnimation(speed);
          f();
        }
      }
    };
  }
  
  function update(world, input, animationManager) {
    let ticksSinceLastFigureFall = world.ticksSinceLastFigureFall;
    let currentFigure = world.currentFigure;
    let gameField = world.gameField;
    
    input.processInput({
      ArrowLeft: () => currentFigure = moveFigure(gameField, currentFigure, Vector.directions.left),
      ArrowRight: () => currentFigure = moveFigure(gameField, currentFigure, Vector.directions.right),
      ArrowDown: () => currentFigure = moveFigure(gameField, currentFigure, Vector.directions.down),
      Enter: () => currentFigure = rotateFigure(gameField, currentFigure, -1)
    }, {abortKeys: ["Enter", "ArrowLeft", "ArrowRight"]});
    
    animationManager.animate("figureFall", world.speed,
      () => {
        let oldPosition = currentFigure.position;
        
        currentFigure = moveFigure(gameField, currentFigure, Vector.directions.down);
        
        if(Vector.equal(oldPosition, currentFigure.position)) {
          // do we need to create new instance of gameField here?
          landFigure(gameField, currentFigure);
          currentFigure = createFigure(gameField);
        }
      });

    gameField = removeCompletedLines(gameField);
    
    return {
      ...world,
      ticksSinceLastFigureFall: ticksSinceLastFigureFall,
      currentFigure: currentFigure,  
      gameField: gameField,
    }
  }
  
  function createRenderCtx(canvasId) {
    let canvas = document.getElementById(canvasId);
    let ctx = canvas.getContext('2d');
    
    return ctx;
  }
  
  function render(world, ctx) {    
    let gameField = world.gameField;
    let figure = world.currentFigure;
    
    function fillCell(x, y, color) {
      if(!color)
        return;
      
      ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
      ctx.fillRect(x * 10, y * 10, 10, 10);
    }
    
    ctx.fillStyle = 'rgb(0,0,0)';    
    ctx.fillRect(0, 0, 10 * world.gameField.width, 10 * world.gameField.height);

    gameField.loop(fillCell);    
    
    figure.data.forEach(vec => {
      let worldPosition = Vector.add(vec, figure.position); 
      fillCell(worldPosition.x, worldPosition.y, figure.color);
    });
  }
  
  function createWorld(speed, width, height) {
    let gameField = createGameField(width, height);
    
    return {
      currentFigure: createFigure(gameField),
      gameField: gameField,
      speed: speed
    }
  }
    
  let renderCtx = createRenderCtx(canvasId);
  let animationManager = createAnimationManager();
  let input = createInput(animationManager, 25);
  let world = createWorld(5, 15, 30);
  
  setInterval(function() {
    world = update(world, input, animationManager);
    render(world, renderCtx);
  }, 5);
}