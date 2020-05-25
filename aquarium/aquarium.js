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

function drawFishEye(ctx, x, y, radius, pupilRatio, lookDirX, lookDirY) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);

  ctx.fillStyle = "#FFFFFF88";
  
  ctx.stroke();
  ctx.fill();
  
  let pupilRadius = radius * pupilRatio;
  let maxPupilOffset = radius - pupilRadius;
  
  let xPupilOffset = maxPupilOffset * lookDirX;
  let yPupilOffset = maxPupilOffset * lookDirY;
  
  ctx.beginPath();
  ctx.arc(x + xPupilOffset, y + yPupilOffset, pupilRadius, 0, 2 * Math.PI);

  ctx.fillStyle = "#001242";
  ctx.fill();
}

function drawFishTail(ctx, x, y, endWidth, length, floaterPhase) {
  let yShift = Math.cos(new Date() / 1000 + floaterPhase) * length * 0.1;

  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x, y + endWidth / 3, x - length, y + endWidth / 2 + yShift);
  ctx.quadraticCurveTo(x - 0.5 * length, y, x - length, y - endWidth / 2 + yShift);
  ctx.quadraticCurveTo(x, y - endWidth / 3, x, y);
}

function drawFishBody(ctx, x, y, height, length) {
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + length / 2, y + height / 2, x + length, y);
  ctx.quadraticCurveTo(x + length / 2, y - height / 2, x, y);
}

function drawFishFloater(ctx, x, y, size, phase) {
  let yShift = Math.sin(new Date() / 1000 + phase) * 0.1 * size;

  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x, y - size * 0.4, x - size, y + size * 0.5 + yShift);
  ctx.quadraticCurveTo(x, y + size * 0.6, x, y);
}

function drawFishTopFloater(ctx, x, y, size, height) {
  ctx.moveTo(x, y);
  ctx.lineTo(x - size * 0.35, y - height);
  ctx.lineTo(x - size * 0.7, 0);
}

function drawFish(ctx, fish, flip, rotation) {
  let {size, position, lookDir, pupilRatio, kind, color, floaterPhase} = fish;
  
  var skewH = Math.cos(new Date() / 1000 + floaterPhase) * 0.05;
  var skewV = Math.sin(new Date() / 1000 + floaterPhase) * 0.05;

  ctx.translate(position.x, position.y);
  ctx.transform(1, skewV, skewH, 1, 0, 0);
  ctx.rotate(rotation);

  if(flip) {
    ctx.transform(-1, 0, 0, 1, 0, 0);
  }

  let bodyLength = size * kind.bodyLength;

  ctx.fillStyle = color;
  ctx.lineWidth = 8 + 4 * Math.random();
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#FFFFFF26";
  ctx.setLineDash([]);
  
  ctx.beginPath();
  
  drawFishTail(ctx, -bodyLength * 0.45, 0, size * kind.tailWidth, size * kind.tailLength, floaterPhase);
  drawFishTopFloater(ctx, bodyLength * 0.2, -size * 0.15, bodyLength, kind.topFloaterHeight * size);
  
  ctx.fill();
  ctx.stroke();
  
  ctx.beginPath();
  
  drawFishBody(ctx, -bodyLength * 0.5, 0, size, bodyLength);
  
  ctx.fill();
  ctx.stroke();
  
  ctx.beginPath();
  
  drawFishFloater(ctx, bodyLength * 0.05, size * 0.1, size * kind.mainFloaterLength, floaterPhase);
  
  ctx.fill();
  ctx.stroke();
  
  drawFishEye(ctx, bodyLength * 0.2, -size * 0.05, size * kind.eyeSize, pupilRatio, lookDir.x, lookDir.y);

  ctx.resetTransform();
}

function drawWeed(ctx, weed) {
  ctx.strokeStyle = weed.color;
  ctx.lineWidth = weed.width;
  ctx.lineCap = "round"; 
  ctx.setLineDash([]);

  ctx.beginPath();
  ctx.moveTo(weed.position.x, weed.position.y);
  
  let segmentsCount = weed.length / weed.segmentLength;
  let currentSegmentBendDir = 1;

  for(let segment = 0; segment < segmentsCount; segment++) {
    let posX = weed.position.x;
    let posY = weed.position.y + segment * weed.segmentLength;
    let bendX = posX + weed.bendDistance * currentSegmentBendDir * 2;
    let bendY = posY + weed.segmentLength * 2.5;

    posX = addShake(posX);
    posY = addShake(posY);
    bendX = addShake(bendX);
    bendY = addShake(bendY);

    ctx.quadraticCurveTo(bendX, bendY, posX, posY);

    currentSegmentBendDir = currentSegmentBendDir * (-1);
  }

  ctx.stroke();

  function addShake(val) {
    return val + Math.sin(Math.random() / 10) * 30;
  }
}

function drawFishes(ctx, fishes) {
  for(let fish of fishes) {
    let flip = fish.moveDir.x < 0;
    
    drawFish(ctx, fish, flip, 0);
  }
}

function drawBubbles(ctx, bubbles) {  
  for(let bubble of bubbles) {
    var scaleH = Math.sin(new Date() / 100) * 0.15;
    var scaleV = Math.cos(new Date() / 100) * 0.15;

    ctx.beginPath(); 
    ctx.transform(1 + scaleH, 0, 0, 1 + scaleV, bubble.position.x, bubble.position.y);

    ctx.moveTo(bubble.currentRadius, 0);
    ctx.arc(0, 0, bubble.currentRadius, 0, 2 * Math.PI);

    ctx.strokeStyle = '#FFFFFF40';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    ctx.resetTransform();
  }
}

function drawWeeds(ctx, weeds, width, height) {
  let currentLayer = 0;

  for(let weed of weeds) {
    if(currentLayer != weed.layer) {
      let phase = Math.sin(new Date() / 1000 + currentLayer) / 50;
      
      ctx.resetTransform();
      ctx.rotate(Math.PI);
      ctx.transform(1, 0, phase, 1, -width, -height * 2 - 50);
  
      currentLayer = weed.layer;
    }

    drawWeed(ctx, weed);
  }
}

function drawAnchor(ctx, x, y, length) {
  let width = 30;
  let plankLength = 150;
  let plankWidth = 25;
  let plankOffset = 80;
  let ballRadius = 20;
  let ringOutRadius = 50;
  let ringInnerRadius =  30;
  
  ctx.fillStyle = "#00000044";
  
  ctx.rotate(Math.PI / 20);
  ctx.translate(x, y);
  ctx.beginPath();

  ctx.rect(-plankLength / 2, plankOffset, plankLength / 2, plankWidth);
  ctx.rect(width, plankOffset, plankLength / 2, plankWidth); 
  ctx.rect(0, 0, width, length); 

  ctx.moveTo(plankLength / 2, ballRadius);
  ctx.arc(plankLength / 2 + ballRadius + width / 2, plankOffset + plankWidth / 2, ballRadius, 0, Math.PI * 2);
  ctx.moveTo(plankLength / 2, ballRadius);
  ctx.arc(-plankLength / 2 - ballRadius + width / 2, plankOffset + plankWidth / 2, ballRadius, 0, Math.PI * 2);

  ctx.moveTo(width / 2, -ringInnerRadius);
  ctx.arc(width / 2, -ringInnerRadius, ringOutRadius, 0, Math.PI * 2, false);
  ctx.arc(width / 2, -ringInnerRadius, ringInnerRadius, 0, Math.PI * 2, true);
    
  ctx.fill();
  
  ctx.translate(width / 2, length);
  ctx.beginPath();

  ctx.moveTo(0, 0);
  drawShoulder(-1);

  ctx.moveTo(0, 0);
  drawShoulder(1);

  ctx.fill();
  ctx.resetTransform();

  function drawShoulder(dir) {
    const shoulderWidth = 180;
    const shoulderHeight = 100;

    ctx.quadraticCurveTo(shoulderWidth * 1.2 * dir, 0, shoulderWidth * dir, -shoulderHeight);
    ctx.lineTo(shoulderWidth * dir * 0.9, -shoulderHeight);
    ctx.lineTo(shoulderWidth * dir, -shoulderHeight - 50);
    ctx.quadraticCurveTo(shoulderWidth * 1.5 * dir, 0, 0, 100);
  }
}

const fishKinds = [{
  tailWidth: 0.45,
  tailLength: 0.5,
  mainFloaterLength: 0.33,
  topFloaterHeight: 0.2,
  bodyLength: 1.1,
  eyeSize: 0.1
},
{
  tailWidth: 0.5,
  tailLength: 0.5,
  mainFloaterLength: 0.4,
  topFloaterHeight: 0.15,
  bodyLength: 0.7,
  eyeSize: 0.08
},
{
  tailWidth: 0.35,
  tailLength: 0.45,
  mainFloaterLength: 0.45,
  topFloaterHeight: 0.2,
  bodyLength: 1,
  eyeSize: 0.11
},
{
  tailWidth: 0.4,
  tailLength: 0.3,
  mainFloaterLength: 0.35,
  topFloaterHeight: 0.15,
  bodyLength: 0.8,
  eyeSize: 0.07
}];

function aquarium(canvasEl) {
  const ctx = canvasEl.getContext('2d');
  const width = window.innerWidth;
  const height = window.innerHeight; 
  const fishes = [];
  const weeds = [];  
  let bubbles = [];
  let lastFrameTime = new Date();

  canvasEl.width = width;
  canvasEl.height = height;

  addSomeFishes(10);
  addSomeWeed(15);

  function addSomeFishes(count) {
    while(--count >= 0) {
      fishes.push({
        position: getRandPos(),
        moveDir: getRandDir(),
        lookDir: getRandDir(),
        size: getRandInRange(50, 200),
        speed: getRandInRange(0.03, 0.1),
        pupilRatio: getRandInRange(0.6, 0.8),
        kind: fishKinds[Math.floor(Math.random() * fishKinds.length)],
        color: getRandColor(130, 200, 0, 150, 0, 150),
        floaterPhase: Math.round(getRandInRange(0, Math.PI * 2))
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
    const minWeedLength = 50;

    while(--count >= 0) {
      var layer = Math.round(getRandInRange(0, 3));
      
      weeds.push({
        length: getRandInRange(minWeedLength, maxWeedLength),
        width: getRandInRange(5, 8),
        layer: layer,
        bendDistance: getRandInRange(10, 20),
        segmentLength: getRandInRange(20, 40),
        color: getRandColor(10, 30, 10, 80, 0, 30),
        position: new Vector(
          getRandInRange(0, width), 
          getRandInRange(height, height + 20))
      });
    }

    weeds.sort((a, b) => a.layer > b.layer);
  }

  function getRandInRange(min, max) {
    return min + Math.random() * (max - min);
  }

  function getRandColor(
    minR = 0, maxR = 255, 
    minG = 0, maxG = 255,
    minB = 0, maxB = 255) {
      
    let r = getRandInRange(minR, maxR);
    let g = getRandInRange(minG, maxG);
    let b = getRandInRange(minB, maxB);

    return getColor(r, g, b);
  }

  function getColor(r, g, b) {
    return `rgb(${r},${g},${b})`;
  }

  function checkInBounds(vec) {
    return (
      vec.x > 0 && 
      vec.x < width &&
      vec.y > 0 &&
      vec.y < height);
  }

  function getBackgroundColor() {
    let g = Math.sin(new Date() / 3000 + 10) * 30;
    let b = Math.sin(new Date() / 2000) * 30 + 20;
    
    return getColor(0, g, b);
  }

  setInterval(function() {
    for(let fish of fishes) {
      let shouldChangeMoveDir = Math.random() > 0.97 || !checkInBounds(fish.position);
      let shouldChangeLookDir = Math.random() > 0.4;
      let shouldMakeBubble = Math.random() > 0.85;

      if(shouldChangeMoveDir) {
        let x = Math.random();
        let y = Math.random() * 0.2;

        if(fish.position.x >= width || fish.lookDir.x > 0) {
          x = x * (-1);
        }

        if(fish.position.y >= height || fish.lookDir.y > 0) {
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
        let radius = getRandInRange(fish.size / 40, fish.size / 15);
        let xOffset = fish.size / 2 - radius;

        if(fish.moveDir.x > 0) {
          bubblePosX += xOffset;
        } else {
          bubblePosX -= xOffset;
        }

        bubbles.push({
          position: new Vector(bubblePosX, bubblePosY),
          radius: radius,
          currentRadius: 0
        });
      }

      bubbles = bubbles.filter(b => checkInBounds(b.position));
    }
  }, 300);

  setInterval(function() {
    const bubbleMoveSpeedFactor = 0.03;
    const bubbleSideMoveAmplitude = 0.2;
    const bubbleSideMoveSpeedFactor = 0.1;
    const backgroundColor = getBackgroundColor(); 
    const currentTime = new Date();
    const delta = currentTime - lastFrameTime;

    lastFrameTime = currentTime;

    for(let fish of fishes) {
      fish.position = fish.position.moveAlong(fish.moveDir, fish.speed * delta);
    }

    for(let bubble of bubbles) {
      var phase = Math.sin(bubble.position.y * bubbleSideMoveSpeedFactor);
      var shiftX = phase * bubbleSideMoveAmplitude;

      bubble.position.y -= bubble.radius * bubbleMoveSpeedFactor * delta;
      bubble.position.x = bubble.position.x + shiftX;
      
      if(bubble.currentRadius < bubble.radius) {
        bubble.currentRadius += Math.min(100, delta) * 0.08
      }
    }

    ctx.resetTransform();
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);

    drawAnchor(ctx, width / 2, height - 510, 380);
    drawFishes(ctx, fishes);
    drawBubbles(ctx, bubbles, delta);
    drawWeeds(ctx, weeds, width, height);
  }, 0);
}

aquarium(document.getElementById("waterCanvas"))