class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  
  add(x, y) {
    [x, y] = this._normalizeArgs(arguments);
  
    return new Vector(this.x + x, this.y + y);
  }
  
  subtract(x, y) {
    [x, y] = this._normalizeArgs(arguments);
    
    return new Vector(this.x - x, this.y - y);
  }
  
  multiply(val) {
    return new Vector(this.x * val, this.y * val);
  }

  moveAlong(vec, val) {
    let rotation = Math.atan2(vec.x, vec.y);

    return new Vector(
      this.x + Math.sin(rotation) * val, 
      this.y + Math.cos(rotation) * val);
  }

  magnitude() {
    return Math.sqrt(
      this.x * this.x + this.y * this.y);
  }

  normalize() {
    let magnitude = this.magnitude();

    return new Vector(
      this.x / magnitude, 
      this.y / magnitude);
  }

  _normalizeArgs(args) {
    return args.length == 1 ?
      [args[0].x, args[0].y] :
      [args[0], args[1]];
  }
}

Vector.up = new Vector(0, 1);
Vector.down = new Vector(0, -1);
Vector.right = new Vector(1, 0);
Vector.left = new Vector(-1, 0);
Vector.zero = new Vector(0, 0);

class Body {
  constructor(id, mass, velocity, dragValue) {
    this.id = id;
    this.mass = mass;
    this.velocity = velocity;
    this.dragValue = dragValue;
  }
}

class Point {
  constructor(id, pos, direction) {
    this.id = id;
    this.pos = pos;
    this.direction = direction;
  }
}

class Platform {
  constructor(id, pos, length) {
    this.id = id;
    this.pos = pos;
    this.length = length;
  }
}

class CircleCollider {
  constructor(id, radius, pos = Vector.zero) {
    this.id = id;
    this.radius = radius;
    this.pos = pos;
  }
}

class Camera {
  constructor(id, pos, size) {
    this.id = id;
    this.pos = pos;
    this.size = size;
  }
}

function attach(id, parentId, points, connections) {
  connections[id] = parentId;

  let point = points[id];
  let parentPoint = points[parentId];
  
  point.pos = point.pos.subtract(parentPoint.pos);  
}

function detach(id, points, connections) {
  let point = points[id];
  let parentPoint = points[connections[id]];

  point.pos = point.pos.add(parentPoint.pos);
  
  connections[id] = null;
}

function simulate(points, bodies, colliders, platforms, tickDuration) {
  for(let body of Object.values(bodies)) {    
    let pixelsInMeter = 80;
    let point = points[body.id];
    let collider = colliders[body.id];
    let newVelocity = Vector.up
      .multiply((9.81 / 10000) * tickDuration * pixelsInMeter)
      .add(body.velocity.multiply(body.dragValue));
    
    if(collider && newVelocity.y > 0) {
      if(onPlatform(platforms, point.pos, collider)) {
        newVelocity.y = 0;
      }
    }
    
    point.pos = point.pos.add(newVelocity);
    body.velocity = newVelocity;    
  }
}

function drawGun(ctx, gunPoint, points, connections) {
  let gunPos = gunPoint.pos;
  
  if(connections[gunPoint.id]) {    
    let attachedToId = connections[gunPoint.id];
    let attachedToPoint = points[attachedToId];
    
    gunPos = new Vector(
      attachedToPoint.pos.x + gunPos.x, 
      attachedToPoint.pos.y + gunPos.y);    
  }

  let endPos = gunPos.moveAlong(gunPoint.direction, 50);

  ctx.strokeStyle = 'red';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(gunPos.x, gunPos.y);
  ctx.lineTo(endPos.x, endPos.y);
  ctx.stroke();
}

function drawDude(ctx, dudePoint, dudeAttributes) {
  let dudePos = dudePoint.pos;
  let radius = dudeAttributes.radius;
  
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(dudePos.x, dudePos.y, radius, 0, Math.PI * 2);
  ctx.stroke();
}

function drawPlatform(ctx, platform) {
  ctx.fillStyle = 'black';
  ctx.fillRect(platform.pos.x, platform.pos.y, platform.length, 10);
}

function updateGunDirection(dudePoint, gunPoint, pointerPos) {
  let dir = pointerPos
    .subtract(dudePoint.pos)
    .normalize();

  gunPoint.direction = dir;
}

function tick(ctx, world) {  
  dudeController(
    world.points["dude"], 
    world.bodies["dude"],
    world.colliders["dude"],
    world.attributes["dude"],
    world.platforms,
    world.actions);

  simulate(
    world.points, 
    world.bodies, 
    world.colliders,
    world.platforms, 
    world.tickDuration);

  updateGunDirection(world.points["dude"], world.points["gun"], world.pointerPos);

  ctx.fillStyle = 'grey';
  ctx.fillRect(0, 0, world.width, world.height);
  ctx.fillStyle = 'black';

  drawDude(ctx, world.points["dude"], world.attributes["dude"]);
  drawGun(ctx, world.points["gun"], world.points, world.connections);
  
  for(let platform of world.platforms) {
    drawPlatform(ctx, platform);
  }
}

function dudeController(
  dudePoint, 
  dudeBody, 
  dudeCollider, 
  dudeAttributes,
  platforms, 
  actions) {  
  
  if(actions["right"]) {
    dudeBody.velocity.x = dudeAttributes.runVelocity;
  }

  if(actions["left"]) {
    dudeBody.velocity.x = -dudeAttributes.runVelocity;
  }

  if(actions["jump"]) {
    if(onPlatform(platforms, dudePoint.pos, dudeCollider)) {
      dudeBody.velocity.y = -(dudeAttributes.jumpForce / dudeBody.mass);
    }

    actions["jump"] = false;
  }
}

function onPlatform(platforms, position, collider) {
  return platforms.some(p => 
    p.pos.x <= position.x && 
    p.pos.x >= position.x - p.length &&
    p.pos.y >= position.y + collider.radius &&
    p.pos.y <= position.y + collider.radius + 5);
}

function rainbowman(canvas) {
  let ctx = canvas.getContext('2d');
  let world = {
    pointerPos: Vector.zero,
    width: canvas.width,
    height: canvas.height,
    tickDuration: 1,
    connections: {},
    actions: {},
    points: {
      "dude": new Point("dude", new Vector(50, 100), Vector.right),
      "gun": new Point("gun", new Vector(50, 100), Vector.right)
    },
    bodies: {  
      "dude": new Body("dude", 50, Vector.zero, 0.98)
    },
    platforms: [
      new Platform("ground", new Vector(0, 300), 300),
      new Platform("ground", new Vector(400, 400), 300)
    ],
    colliders: {
      "dude": new CircleCollider("dude", 20)
    },
    attributes: {
      "dude": {
        radius: 20, 
        jumpForce: 500,
        runVelocity: 1.5
      }
    }
  };

  attach("gun", "dude", world.points, world.connections);

  setInterval(() => {
    tick(ctx, world);
  }, world.tickDuration);
  
  addEventListener("keydown", ev => {
    switch(ev.code) {
      case 'ArrowLeft':
      case 'KeyA':        
        world.actions["right"] = false; 
        world.actions["left"] = true;
        break;
      case 'ArrowRight': 
      case 'KeyD':
        world.actions["left"] = false;
        world.actions["right"] = true;
        break;
      case 'ArrowUp':
      case 'KeyW':
        world.actions['jump'] = true;
        break; 
    }
  });

  addEventListener("keyup", ev => {
    switch(ev.code) {
      case 'ArrowLeft':
      case 'KeyA': 
        world.actions["left"] = false;
        break;
      case 'ArrowRight': 
      case 'KeyD':
        world.actions["right"] = false;
        break;
    }
  });

  addEventListener("mousemove", ev => {
    world.pointerPos = new Vector(ev.clientX, ev.clientY);
  });
}