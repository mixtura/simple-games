function Vector(x, y) {
  this.x = x;
  this.y = y;
}

Vector.prototype.add = function(vec2) {
  return new Vector(this.x + vec2.x, this.y + vec2.y);  
}

Vector.prototype.subtract = function(vec2) {
  return new Vector(this.x - vec2.x, this.y - vec2.y);
}

Vector.prototype.multiply = function(value) {
  return new Vector(this.x * value, this.y * value);
}

Vector.prototype.moveAlong = function(vec, val) {
  let rotation = Math.atan2(vec.x, vec.y);

  return new Vector(
    this.x + Math.sin(rotation) * val, 
    this.y + Math.cos(rotation) * val);
}

Vector.prototype.magnitude = function() {
  return Math.sqrt(this.x * this.x + this.y * this.y);
}

Vector.prototype.normalize = function() {
  let magnitude = this.magnitude();

  return new Vector(
    this.x / magnitude, 
    this.y / magnitude);
}

Vector.up = new Vector(0, 1);
Vector.left = new Vector(-1, 0);
Vector.right = new Vector(1, 0);
Vector.down = new Vector(0, -1);

Vector.fromAngle = function(angle) {
  return new Vector(Math.cos(angle), Math.sin(angle));
}

function drawEye(ctx, x, y, radius, pupilRatio, lookDirX, lookDirY) {
  ctx.fillStyle = "#FFFFFF";
  
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.fill();
  
  ctx.fillStyle = "#001242";

  var pupilRadius = radius * pupilRatio;
  var maxPupilOffset = radius - pupilRadius;

  var xPupilOffset = maxPupilOffset * lookDirX;
  var yPupilOffset = maxPupilOffset * lookDirY;

  ctx.beginPath();
  ctx.arc(x + xPupilOffset, y + yPupilOffset, pupilRadius, 0, 2 * Math.PI);
  ctx.fill();
}

function drawTail(ctx, x, y, firstWidth, secondWidth, length) {
  // points:
  // 4\
  // | \
  // |  0
  // 3  |
  // |  1
  // | /
  // 2/

  ctx.beginPath();
  ctx.moveTo(x, y - firstWidth / 2); // 0
  ctx.lineTo(x, y + firstWidth / 2); // 1
  ctx.quadraticCurveTo(x, y + secondWidth / 3, x - length, y + secondWidth / 2); // 2
  ctx.quadraticCurveTo(x - length * 0.6, y, x - length, y - secondWidth / 2);
  ctx.quadraticCurveTo(x, y - secondWidth / 3, x, y - firstWidth / 2);
  ctx.fill();
}

function drawBody(ctx, x, y, length) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + length / 2, y + length / 2, x + length, y);
  ctx.quadraticCurveTo(x + length / 2, y - length / 2, x, y);
  ctx.fill();
}

function drawFish(ctx, fish, flip, rotation) {
  var {size, position, lookDir, pupilRatio, kind, color} = fish;
  
  ctx.translate(position.x, position.y);
  ctx.rotate(rotation);

  if(flip) {
    ctx.transform(-1, 0, 0, 1, 0, 0);
  }

  ctx.fillStyle = color;

  drawBody(ctx, -size * 0.5, 0, size);
  drawTail(ctx, -size * 0.35, 0, size * 0.05, size * kind.tailWidthRatio, size * kind.tailLengthRatio);

  ctx.fillStyle = color;

  drawEye(ctx, size * 0.2, 0, size * 0.1, pupilRatio, lookDir.x, lookDir.y);

  ctx.resetTransform();
}

function drawBubble(ctx, buble) {
  ctx.strokeStyle = '#FFFFFFB1';
  ctx.lineWidth = 1.2;
  
  ctx.beginPath();
  ctx.arc(buble.position.x, buble.position.y, buble.radius, 0, 2 * Math.PI);
  ctx.stroke();
}

function drawWeed(ctx, weed) {
  ctx.strokeStyle = weed.color;
  ctx.lineWidth = weed.width; 

  ctx.beginPath();
  ctx.moveTo(weed.position.x, weed.position.y);

  var segmentsCount = weed.length / weed.segmentLength;
  var currentSegmentBendDir = 1;

  for(var segment = 0; segment < segmentsCount; segment++) {
    var posX = weed.position.x;
    var posY = weed.position.y + segment * weed.segmentLength;
    var bendX = posX + weed.bendDistance * currentSegmentBendDir * 2;
    var bendY = posY + weed.segmentLength * 1.1;

    ctx.quadraticCurveTo(bendX, bendY, posX, posY);

    currentSegmentBendDir = currentSegmentBendDir * (-1);
  }

  ctx.stroke();
}

function aquarium(canvasEl) {
  const ctx = canvasEl.getContext('2d');
  const fishes = [];
  const bubbles = [];
  const weeds = [];  
  const width = window.innerWidth;
  const height = window.innerHeight; 

  const backgroundColor = getRandColor(
    maxR = 10,
    minR = 10,
    minB = 50, 
    maxB = 70,
    minG = 20, 
    maxG = 40);

  const fishKinds = [{
    tailWidthRatio: 0.4,
    tailLengthRatio: 0.25
  },
  {
    tailWidthRatio: 0.5,
    tailLengthRatio: 0.3
  },
  {
    tailWidthRatio: 0.4,
    tailLengthRatio: 0.4
  }];

  canvasEl.width = width;
  canvasEl.height = height;

  addSomeFishes(10);
  addSomeWeed(20);

  function addSomeFishes(count) {
    while(--count >= 0) {
      fishes.push({
        position: getRandPos(),
        moveDir: getRandDir(),
        lookDir: getRandDir(),
        size: getRandInRange(30, 150),
        speed: getRandInRange(0.1, 0.5),
        pupilRatio: getRandInRange(0.6, 0.8),
        kind: fishKinds[Math.floor(Math.random() * fishKinds.length)],
        color: getRandColor()
      });
    }

    function getRandPos() {
      return new Vector(
        Math.random() * width,
        Math.random() * height
      );
    }

    function getRandDir() {
      return new Vector(
        Math.random() * 2 - 1,
        Math.random() * 2 - 1
      );
    }
  }

  function addSomeWeed(count) {
    const maxWeedLength = 500;
    const minWeedLength = 100;

    while(--count >= 0) {
      weeds.push({
        length: getRandInRange(minWeedLength, maxWeedLength),
        width: getRandInRange(2, 5),
        layer: Math.round(getRandInRange(0, 3)),
        bendDistance: getRandInRange(5, 20),
        segmentLength: getRandInRange(30, 40),
        color: getRandColor(0, 10, 50, 60, 80, 180),
        position: new Vector(
          getRandInRange(0, width), 
          getRandInRange(height, height + 20))
      });
    }

    weeds.sort((a, b) => a.layer > b.layer);
  }

  function getRandColor(
    minR = 0, maxR = 255, 
    minB = 0, maxB = 255, 
    minG = 0, maxG = 255) {
      
    var r = getRandInRange(minR, maxR);
    var g = getRandInRange(minG, maxG);
    var b = getRandInRange(minB, maxB);

    return `rgb(${r},${g},${b})`;
  }

  function getRandInRange(min, max) {
    return min + Math.floor(Math.random() * (max - min));
  }

  function checkInBounds(vec) {
    return (
      vec.x > 0 && 
      vec.x < width &&
      vec.y > 0 &&
      vec.y < height);
  }

  setInterval(function() {
    for(var fish of fishes) {
      var shouldChangeMoveDir = Math.random() > 0.9 || !checkInBounds(fish.position);
      var shouldChangeLookDir = Math.random() > 0.4;
      var shouldMakeBubble = Math.random() > 0.8;

      if(shouldChangeMoveDir) {
        var x = Math.random();
        var y = Math.random();

        if(fish.moveDir.x > 0) {
          x = x * (-1);
        } 

        if(fish.moveDir.y > 0) {
          y = y * (-1);
        }

        fish.moveDir = new Vector(x, y);
      }

      if(shouldChangeLookDir) {
        fish.lookDir = new Vector(
          Math.random() - 0.5, 
          Math.random() - 0.5);
      }

      if(shouldMakeBubble) {
        let bubblePosX = fish.position.x;
        let bubblePosY = fish.position.y;
        
        if(fish.moveDir.x > 0) {
          bubblePosX += fish.size / 2;
        } else {
          bubblePosX -= fish.size / 2;
        }

        bubbles.push({
          position: new Vector(bubblePosX, bubblePosY),
          radius: getRandInRange(2, fish.size / 10)
        });
      }
    }
  }, 300);

  setInterval(function() {
    ctx.resetTransform();
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);

    drawFishes();
    drawBubbles();
    drawWeeds();

    function drawFishes() {
      for(var fish of fishes) {
        fish.position = fish.position.moveAlong(fish.moveDir, fish.speed);
  
        var flip = fish.moveDir.x < 0;
        
        drawFish(ctx, fish, flip, 0);
      }
    }
    
    function drawBubbles() {
      const bubbleMoveSpeedFactor = 0.1;
      const bubbleSideMoveAmplitude = 0.2;
      const bubbleSideMoveSpeedFactor = 0.1;

      for(var bubble of bubbles) {
        bubble.position.y -= bubble.radius * bubbleMoveSpeedFactor;
        bubble.position.x = 
          bubble.position.x + 
          Math.sin(bubble.position.y * bubbleSideMoveSpeedFactor) * 
          bubbleSideMoveAmplitude;

        drawBubble(ctx, bubble);
      }
    }

    function drawWeeds() {
      var currentLayer = 0;
    
      for(var weed of weeds) {
        if(currentLayer != weed.layer) {
          var phase = Math.sin(new Date() / 1000 + currentLayer) / 50;
          
          ctx.resetTransform();
          ctx.rotate(Math.PI);
          ctx.transform(1, 0, phase, 1, -width, -height * 2 - 50);
      
          currentLayer = weed.layer;
        }

        drawWeed(ctx, weed);
      }
    }

  }, 0);
}