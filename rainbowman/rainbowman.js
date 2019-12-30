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

function attach(point, parentPoint, connections) {
  connections[point.id] = parentPoint.id;
  
  point.pos = point.pos.subtract(parentPoint.pos);  
}

function detach(point, parentPoint, connections) {
  point.pos = point.pos.add(parentPoint.pos);
  
  connections[point.id] = null;
}

function simulate(points, bodies, colliders, platforms, tickDuration) {
  for(let id of Object.keys(bodies).filter(k => !!bodies[k])) {    
    let pixelsInMeter = 80;
    let point = points[id];
    let body = bodies[id];
    let collidersToCheck = colliders[id] || [];
    let pointOnPlatform = onPlatform(platforms, point.pos, collidersToCheck);
    let newVelocity = Vector.up
      .multiply((9.81 / 10000) * tickDuration * pixelsInMeter)
      .add(body.velocity.multiply(body.dragValue));
    
    if(newVelocity.y > 0 && pointOnPlatform) {
      newVelocity.y = 0;
    }
    
    point.pos = point.pos.add(newVelocity);
    body.velocity = newVelocity;    
  }
}

function drawGun(ctx, gunPoint, points, connections) {
  let gunPos = gunPoint.pos;
  
  if(connections[gunPoint.id]) {    
    let attachedToId = connections[gunPoint.id];
    let attachedToPoint = Object
      .values(points)
      .find(p => p.id == attachedToId);
    
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
  dudeColliders, 
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
    if(onPlatform(platforms, dudePoint.pos, dudeColliders)) {
      dudeBody.velocity.y = -(dudeAttributes.jumpForce / dudeBody.mass);
    }

    actions["jump"] = false;
  }
}

function onPlatform(platforms, position, colliders) {
  return platforms.some(p => colliders.some(c => {    
    let colliderPos = position.add(c.pos);
    
    return (
      p.pos.x <= colliderPos.x && 
      p.pos.x >= colliderPos.x - p.length &&
      p.pos.y >= colliderPos.y + c.radius &&
      p.pos.y <= colliderPos.y + c.radius + 5);  
  }));
}

function mapEntity(id, world, entityDesc) {
  world.points[id] = entityDesc.point;
  world.colliders[id] = entityDesc.colliders;
  world.attributes[id] = entityDesc.attributes;
  world.bodies[id] = entityDesc.body;
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
    platforms: [
      new Platform("platform-1", new Vector(0, 300), 300),
      new Platform("platform-2", new Vector(400, 400), 300)
    ],
    points: {},
    bodies: {},
    colliders: {},
    attributes: {}
  };

  mapEntity("dude", world, {
    point: new Point("dude-point", new Vector(50, 100), Vector.right),
    body: new Body("dude-body", 50, Vector.zero, 0.98),
    colliders: [
      new CircleCollider("dude-collider-1", 20, Vector.left.multiply(25)), 
      new CircleCollider("dude-collider-2", 20, Vector.right.multiply(25))],
    attributes: {
      radius: 20, 
      jumpForce: 500,
      runVelocity: 1.5
    }
  });

  mapEntity("gun", world, {
    point: new Point("gun-point", new Vector(50, 100), Vector.right),
  });

  attach(world.points["gun"], world.points["dude"], world.connections);

  setInterval(() => tick(ctx, world), world.tickDuration);
  
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