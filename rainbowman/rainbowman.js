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

    return new Vector(this.x + Math.sin(rotation) * val, this.y + Math.cos(rotation) * val);
  }

  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize() {
    let magnitude = this.magnitude();

    return new Vector(this.x / magnitude, this.y / magnitude);
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

function simulate(points, bodies, groundColliders, tickDuration) {
  for(let body of Object.values(bodies)) {    
    let point = points[body.id];
    let newVelocity = Vector.up
      .multiply((9.8 / 1000000) * tickDuration * body.mass)
      .add(body.velocity.multiply(body.dragValue));
    
    let newPos = point.pos.add(newVelocity);
    let collider = groundColliders[body.id];
    
    if(collider && collider.add(newPos).y > 350) {
      newPos.y = point.pos.y;
      newVelocity.y = 0;
    }

    point.pos = newPos;
    body.velocity = newVelocity;    
  }
}

function drawGun(ctx, points, connections) {
  let point = points['gun'];
  let pos = point.pos;
  
  if(connections['gun']) {    
    let attachedToId = connections['gun'];
    let attachedToPoint = points[attachedToId];
    
    pos = new Vector(
      attachedToPoint.pos.x + pos.x, 
      attachedToPoint.pos.y + pos.y);    
  }

  let endPos = pos.moveAlong(point.direction, 50);

  ctx.strokeStyle = 'red';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
  ctx.lineTo(endPos.x, endPos.y);
  ctx.stroke();
}

function drawDude(ctx, points, attributes) {
  let point = points['dude'];
  let radius = attributes['dude'].radius;
  
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(point.pos.x, point.pos.y, radius, 0, Math.PI * 2);
  ctx.stroke();
}

function tick(ctx, world) {  
  controller(
    world.points,
    world.groundColliders, 
    world.bodies, 
    world.actions);

  simulate(
    world.points, 
    world.bodies, 
    world.groundColliders, 
    world.tickDuration);

  ctx.fillStyle = 'grey';
  ctx.fillRect(0, 0, world.width, world.height);
  ctx.fillStyle = 'black';

  drawDude(ctx, world.points, world.attributes);
  drawGun(ctx, world.points, world.connections);  
}

function controller(pointers, groundColliders, bodies, actions) {
  let dudePoints = pointers["dude"];
  let dudeBody = bodies["dude"];
  let dudeGroundCollider = groundColliders["dude"];

  if(actions["right"]) {
    dudeBody.velocity.x = 1;
  }

  if(actions["left"]) {
    dudeBody.velocity.x = -1;
  }

  if(actions["jump"]) {
    if(dudeGroundCollider.add(dudePoints.pos).y >= 348) {
      dudeBody.velocity.y = -2;
    }
    actions["jump"] = false;
  }
}

function rainbowman(canvas) {
  let ctx = canvas.getContext('2d');

  let world = {
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
      "dude": new Body("dude", 7000, Vector.zero, 0.98)
    },
    groundColliders: {
      "dude": Vector.down.multiply(50)
    },
    attributes: {
      "dude": {
        radius: 50
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
        world.actions["right"] = false; 
        world.actions["left"] = true;
        break;
      case 'ArrowRight': 
        world.actions["left"] = false;
        world.actions["right"] = true;
        break;
      case 'ArrowUp':
        world.actions['jump'] = true;
        break; 
    }
  });

  addEventListener("keyup", ev => {
    switch(ev.code) {
      case 'ArrowLeft': 
        world.actions["left"] = false;
        break;
      case 'ArrowRight':
        world.actions["right"] = false;
        break;
    }
  });

  addEventListener("mousemove", ev => {
    let dudePoint = world.points["dude"];
    let gunPoint = world.points["gun"];
    let dir = new Vector(ev.clientX, ev.clientY)
      .subtract(dudePoint.pos)
      .normalize();

    gunPoint.direction = dir;
  });
}