class Body {
  constructor(id, mass, velocity, dragValue) {
    this.id = id;
    this.mass = mass;
    this.velocity = velocity;
    this.dragValue = dragValue;
  }
}

class Point {
  constructor(id, pos, localPos = Vector.zero, direction = Vector.zero) {
    this.id = id;
    this.pos = pos;
    this.localPos = localPos;
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
  constructor(id, size) {
    this.id = id;
    this.size = size;
  }
}

function attach(point, parentPoint, connections) {
  connections[point.id] = parentPoint.id;
  
  point.pos = parentPoint.pos;  
}

function detach(point, connections) {  
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
    
    gunPos = attachedToPoint.pos.add(gunPoint.localPos);    
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
  ctx.fillRect(
    platform.pos.x, 
    platform.pos.y, 
    platform.length, 
    10);
}

function updateGunDirection(dudePoint, gunPoint, camera, pointerPos) {
  let dudeScreenPos = toScreenPos(camera, dudePoint.pos);
  let dir = pointerPos
    .subtract(dudeScreenPos)
    .normalize();

  gunPoint.direction = dir;
}

function updateCamera(ctx, cameraId, points, attributes) {
  let point = points[cameraId];
  let cameraAttrs = attributes[cameraId];
  let targetPoint = Object.values(points).find(p => p.id == cameraAttrs.targetId);
  let targetPos = targetPoint.pos.add(point.localPos);
  let currentPos = point.pos;
  let translateVec = new Vector(
    (currentPos.x - targetPos.x) * cameraAttrs.smoothness, 
    (currentPos.y - targetPos.y) * cameraAttrs.smoothness);
  
  point.pos = new Vector(
    currentPos.x - translateVec.x, 
    currentPos.y - translateVec.y);

  ctx.translate(translateVec.x, translateVec.y); 
}

function flashCanvas(ctx, cameraPoint, cameraAttrs) {  
  let cameraPos = cameraPoint.pos;

  ctx.fillStyle = 'grey';
  ctx.fillRect(
    cameraPos.x, 
    cameraPos.y, 
    cameraAttrs.width, 
    cameraAttrs.height);
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

  updateGunDirection(
    world.points["dude"], 
    world.points["gun"], 
    world.points["maincamera"], 
    world.pointerPos);
  
  updateCamera(ctx, "maincamera", world.points, world.attributes);

  flashCanvas(ctx, world.points["maincamera"], world.attributes["maincamera"]);

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

  if(actions["jump"] && onPlatform(platforms, dudePoint.pos, dudeColliders)) {
    for(let p of platforms) {
      p.disable = false;
    }

    dudeBody.velocity.y = -(dudeAttributes.jumpForce / dudeBody.mass);
  
    actions["jump"] = false;
  }

  if(actions["down"]) {
    let platform = onPlatform(platforms, dudePoint.pos, dudeColliders);

    if(platform) {
      platform.disable = true;
    }

    actions["down"] = false;
  }
}

function onPlatform(platforms, position, colliders) {
  return platforms.filter(p => !p.disable).find(p => colliders.some(c => {    
    let colliderPos = position.add(c.pos);

    return (
      p.pos.x <= colliderPos.x && 
      p.pos.x >= colliderPos.x - p.length &&
      p.pos.y >= colliderPos.y + c.radius &&
      p.pos.y <= colliderPos.y + c.radius + 5);  
  }));
}

function toScreenPos(camera, pos) {
  return pos.subtract(camera.pos);
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
    tickDuration: 1,
    connections: {},
    actions: {},
    platforms: [
      new Platform("platform-1", v(0, 300), 300),
      new Platform("platform-2", v(100, 400), 700),
      new Platform("platform-3", v(0, 500), 500),
      new Platform("platform-4", v(300, 600), 400)
    ],
    points: {},
    bodies: {},
    colliders: {},
    attributes: {}
  };

  mapEntity("maincamera", world, {
    point: new Point("maincamera-point", v(0, 0), v(-200, -200)),
    attributes: {
      size: 1,
      targetId: "dude-point",
      smoothness: 0.05,
      width: canvas.width,
      height: canvas.height
    }
  });

  mapEntity("dude", world, {
    point: new Point("dude-point", v(0, 0), Vector.right),
    body: new Body("dude-body", 50, Vector.zero, 0.98),
    colliders: [
      new CircleCollider("dude-collider-1", 20, Vector.left.multiply(25)), 
      new CircleCollider("dude-collider-2", 20, Vector.right.multiply(25))],
    attributes: {
      radius: 20, 
      jumpForce: 350,
      runVelocity: 1.5
    }
  });

  mapEntity("gun", world, {
    point: new Point("gun-point", v(50, 100), Vector.zero, Vector.right),
  });

  attach(world.points["gun"], world.points["dude"], world.connections);
  attach(world.points["maincamera"], world.points["dude"], world.connections);

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
      case 'ArrowDown':
      case 'KeyS':
        world.actions['down'] = !world.actions['downpressed'];
        world.actions['downpressed'] = true;
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
      case 'ArrowUp':
      case 'KeyW':
        world.actions['jump'] = false;
        break; 
      case 'ArrowDown':
      case 'KeyS':
        world.actions['downpressed'] = false;
        break;
    }
  });

  addEventListener("mousemove", ev => {
    world.pointerPos = new Vector(ev.clientX, ev.clientY);
  });
}