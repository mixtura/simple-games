class Body {
  constructor(id, mass, velocity, dragValue) {
    this.id = id;
    this.mass = mass;
    this.velocity = velocity;
    this.dragValue = dragValue;
  }
}

class Point {
  constructor(id, pos, localPos = v.zero, direction = v.zero) {
    this.id = id;
    this.pos = pos;
    this.localPos = localPos;
    this.direction = direction;
  }
}

class Spring {
  constructor(id, accelaration, targetId, dragValue, velocity = v.zero, maxLength = null, minLength = null) {
    this.id = id;
    this.accelaration = accelaration;
    this.targetId = targetId;
    this.dragValue = dragValue;
    this.velocity = velocity;
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
  constructor(id, radius, pos = v.zero, bypassPlatforms = {}) {
    this.id = id;
    this.radius = radius;
    this.pos = pos;
    this.bypassPlatforms = bypassPlatforms;
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

function simulate(points, bodies, colliders, springs, platforms, tickDuration) {
  for(let id of Object.keys(bodies).filter(k => bodies[k])) {    
    let point = points[id];
    let body = bodies[id];
    let collidersToCheck = colliders[id] || [];
    let pointOnPlatform = onPlatform(platforms, point.pos, collidersToCheck);    
    let newVelocity = simulateGravity(body.velocity, body.dragValue, tickDuration);
    
    if(newVelocity.y > 0 && pointOnPlatform) {
      newVelocity.y = 0;
    }
    
    point.pos = point.pos.add(newVelocity);
    body.velocity = newVelocity;    
  }

  for(let id of Object.keys(springs).filter(s => springs[s])) {
    let point = points[id];
    let spring = springs[id];
    let targetPoint = points[spring.targetId];
    let currentLength = point.pos.subtract(targetPoint.pos).magnitude();
    let newVelocity = simulateSpring(
      spring.velocity, 
      point, 
      spring.accelaration,
      targetPoint);

    let newPos = point.pos.add(newVelocity);
    let newLength = newPos.subtract(targetPoint.pos).magnitude();

    if(newLength > currentLength) {
      newVelocity = newVelocity.multiply(spring.dragValue);
    }

    point.pos = point.pos.add(newVelocity);
    spring.velocity = newVelocity;
  }
}

function simulateGravity(velocity, dragValue, tickDuration) {
  let pixelsInMeter = 80;

  return v.up
    .multiply((9.81 / 10000) * tickDuration * pixelsInMeter)
    .add(velocity.multiply(dragValue));
}

function simulateSpring(velocity, point, accelaration, targetPoint) {
  return targetPoint.pos
    .subtract(point.pos)
    .normalize()
    .multiply(accelaration)
    .add(velocity); 
}

function flashCanvas(ctx, cameraEntity) {  
  let cameraPos = cameraEntity.point.pos;
  let cameraScale = cameraEntity.attributes.scale;

  ctx.fillStyle = 'grey';
  ctx.fillRect(
    cameraPos.x * (2 - cameraScale), 
    cameraPos.y * (2 - cameraScale), 
    cameraEntity.attributes.width * (2 - cameraScale), 
    cameraEntity.attributes.height * (2 - cameraScale));
}

function drawGun(ctx, gunEntity, points, connections) {
  let gunStartPos = gunEntity.point.pos;
  let gunPoint = gunEntity.point;
  let gunLength = gunEntity.attributes.length;
  
  if(connections[gunPoint.id]) {    
    let attachedToId = connections[gunPoint.id];
    let attachedToPoint = Object
      .values(points)
      .find(p => p.id == attachedToId);
    
    gunStartPos = attachedToPoint.pos
      .add(gunPoint.localPos);    
  }

  let gunEndPos = gunStartPos
    .moveAlong(gunPoint.direction, gunLength);

  ctx.strokeStyle = 'red';
  ctx.lineWidth = 5;

  ctx.beginPath();
  ctx.moveTo(gunStartPos.x, gunStartPos.y);
  ctx.lineTo(gunEndPos.x, gunEndPos.y);
  ctx.closePath();
  ctx.stroke();
}

function drawDude(ctx, dudeEntity) {
  let dudePos = dudeEntity.point.pos;
  let radius = dudeEntity.attributes.radius;
  
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 5;

  ctx.beginPath();
  ctx.arc(dudePos.x, dudePos.y, radius, 0, Math.PI * 2);
  ctx.closePath();
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

function drawBall(ctx, ball) {
  let pos = ball.point.pos;
  let radius = ball.attributes.radius;
  
  ctx.strokeStyle = 'red';
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.stroke();
}

function drawSatellite(ctx, satellite) {
  let pos = satellite.point.pos;
  let radius = satellite.attributes.radius;
  let color = satellite.attributes.color;

  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.stroke();
}

function drawNet(ctx, points) {
  let maxDistance = 100;

  for(var satelliteIndex = 0; satelliteIndex < points.length; satelliteIndex++) {
    var pos1 = points[satelliteIndex].pos;
    
    for(var satelliteIndex2 = satelliteIndex + 1; satelliteIndex2 < points.length; satelliteIndex2++) {
      if(satelliteIndex == satelliteIndex2) {
        continue;
      }
            
      var pos2 = points[satelliteIndex2].pos;      
      var distance = pos1.distance(pos2);

      distance = distance <= 2 ? 2 : distance;
            
      ctx.strokeStyle = 'white';
      ctx.lineWidth = maxDistance / distance;
      ctx.beginPath();
      ctx.moveTo(pos1.x, pos1.y);
      ctx.lineTo(pos2.x, pos2.y);
      ctx.stroke();
    }
  }
}

function updateGunDirection(dudePoint, gunPoint, camera, pointerPos) {
  let dudeScreenPos = toScreenPos(camera, dudePoint.pos);
  let dir = pointerPos
    .subtract(dudeScreenPos)
    .normalize();

  gunPoint.direction = dir;
}

function updateCamera(ctx, cameraEntity, points) {
  let point = cameraEntity.point;
  let cameraAttrs = cameraEntity.attributes;
  let currentPos = point.pos;
  
  let targetPos = Object
    .values(points)
    .find(p => p.id == cameraAttrs.targetId)
    .pos
    .add(point.localPos);
  
  let translateVec = new Vector(
    (currentPos.x - targetPos.x) * cameraAttrs.smoothness, 
    (currentPos.y - targetPos.y) * cameraAttrs.smoothness);
  
  point.pos = new Vector(
    currentPos.x - translateVec.x, 
    currentPos.y - translateVec.y);

  ctx.translate(translateVec.x, translateVec.y); 
}

function tick(ctx, world) {  
  let satelliteIds = Object
    .keys(world.attributes)
    .filter(k => k.startsWith("satellite"));
  
  let dudeSprings = satelliteIds.map(k => world.springs[k]);
  
  dudeController(
    selectEntity("dude", world),
    world.platforms,
    world.actions,
    toWorldPos(world.points["maincamera"], world.pointerPos),
    dudeSprings);

  simulate(
    world.points, 
    world.bodies,
    world.colliders,
    world.springs,
    world.platforms, 
    world.tickDuration);

  updateGunDirection(
    world.points["dude"], 
    world.points["gun"], 
    world.points["maincamera"], 
    world.pointerPos);
  
  updateCamera(ctx, selectEntity("maincamera", world), world.points);

  flashCanvas(ctx, selectEntity("maincamera", world));

  drawDude(ctx, selectEntity("dude", world));
  
  drawGun(ctx, selectEntity("gun", world), world.points, world.connections);

  

  for(let satelliteId of satelliteIds) {
    drawSatellite(ctx, selectEntity(satelliteId, world));
  }

  // drawNet(ctx, setelliteIds.map(id => world.points[id]));
  
  for(let platform of world.platforms) {
    drawPlatform(ctx, platform);
  }
}

function dudeController(
  dudeEntity,
  platforms, 
  actions,
  pointerPos,
  dudeSatteliteSprings) {

  let {body, attributes, colliders, point} = dudeEntity;
  let platform = onPlatform(platforms, point.pos, colliders);

  if(platform && !attributes.landingTime) {
    attributes.landingTime = new Date();
  }

  if(actions["right"]) {
    body.velocity.x = attributes.runVelocity;
  }

  if(actions["left"]) {
    body.velocity.x = -attributes.runVelocity;
  }

  if(actions["jump"] && platform) {    
    let isTimeToJump = 
      (new Date() - attributes.landingTime) > attributes.jumpCooldown;
    
    if(isTimeToJump) {      
      body.velocity.y = -(attributes.jumpForce / body.mass);
    
      for(let collider of colliders) {
        collider.bypassPlatforms = {};
      }

      actions["jump"] = false;
      attributes.passPlatform = true;
      attributes.landingTime = null;
    }
  }

  if(actions["fall"]) {
    if(platform) {
      let isTimeToFall = 
        (new Date() - attributes.landingTime) > attributes.fallCooldown;
      
      if(isTimeToFall) {
        for(let collider of colliders) {
          collider.bypassPlatforms[platform.id] = true;
        }
        
        attributes.landingTime = null;
        actions[fall] = false;
      }

    } else {
      body.velocity.y = (attributes.jumpForce / body.mass);
      actions["fall"] = false;
    }
  } 

  if(!actions["fall"]) {
    attributes.passPlatform = false;
  }
}

function onPlatform(platforms, position, colliders) {
  return platforms
    .find(p => colliders
      .filter(c => !c.bypassPlatforms[p.id])
      .some(c => {
        let colliderPos = position.add(c.pos);

        return (
          p.pos.x <= colliderPos.x && 
          p.pos.x >= colliderPos.x - p.length &&
          p.pos.y >= colliderPos.y + c.radius &&
          p.pos.y <= colliderPos.y + c.radius + 5);  
      }));
}

function toScreenPos(cameraPoint, pos) {
  return pos.subtract(cameraPoint.pos);
}

function toWorldPos(cameraPoint, pos) {
  return pos.add(cameraPoint.pos);
}

function isOnScreen(camera, pos) {
  let posInScreenCoordinates = toScreenPos(camera.point, pos);
  let camAttr = camera.attributes;

  return ( 
    posInScreenCoordinates.x > camAttr.width ||
    posInScreenCoordinates.x < 0 ||
    posInScreenCoordinates.y > camAttr.height ||
    posInScreenCoordinates.y < 0
  );
}

function mapEntity(id, world, entityDesc) {
  world.points[id] = entityDesc.point;
  world.colliders[id] = entityDesc.colliders;
  world.attributes[id] = entityDesc.attributes;
  world.bodies[id] = entityDesc.body;
  world.springs[id] = entityDesc.spring;
}

function selectEntity(id, world) {
  return {
    point: world.points[id],
    colliders: world.colliders[id],
    attributes: world.attributes[id],
    body: world.bodies[id],
    spring: world.springs[id]
  };
}

function rainbowman(canvas) {
  let ctx = canvas.getContext('2d');

  let world = {
    pointerPos: v.zero,
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
    springs: {},
    colliders: {},
    attributes: {}
  };

  mapEntity("maincamera", world, {
    point: new Point("maincamera-point", v(0, 0), v(-canvas.width/2, -canvas.height/2)),
    attributes: {
      scale: 1,
      targetId: "dude-point",
      smoothness: 0.05,
      width: canvas.width,
      height: canvas.height
    }
  });

  mapEntity("dude", world, {
    point: new Point("dude-point", v(0, 0), v.zero, v.right),
    body: new Body("dude-body", 50, v.zero, 0.98),
    colliders: [
      new CircleCollider("dude-collider-1", 20, v.left.multiply(25)), 
      new CircleCollider("dude-collider-2", 20, v.right.multiply(25))],
    attributes: {
      radius: 20, 
      jumpForce: 350,
      runVelocity: 2.5,
      jumpCooldown: 100,
      fallCooldown: 100,
      landingTime: 0,
      passPlatform: false
    }
  });

  mapEntity("gun", world, {
    point: new Point("gun-point", v(0, 0), v.zero, v.right),
    attributes: {
      length: 20
    }
  });

  // function ballDesc(id) {
  //   return {
  //     point: new Point(id + "-point", v(0, 0), v(0, 0), v.zero),
  //     colliders: [new CircleCollider(id + "-collider", 10)],
  //     body: new Body(id + "-body", 10, v.zero, 2),
  //     attributes: {
  //       radius: 10 
  //     },
  //   };
  // }

  for(let num in [...Array(100).keys()]) {
    let id = "satellite" + num;
    let accelaration = Math.random() * 0.05 + 0.06;
    let dragValue = Math.random() * 0.05 + 0.5;
    let radius = Math.random() * 15 + 3;
    let color = `rgb(${getRandColorChannel(0, 255)},${getRandColorChannel(0, 255)},${getRandColorChannel(0, 255)}`;

    function getRandColorChannel(min, max) {
      return min + Math.floor(Math.random() * max);
    }

    mapEntity(id, world, {
      point: new Point(id + "-point", v(0, 0), v(0, 0), v.zero),
      spring: new Spring(id + "-spring", accelaration, "dude", dragValue),
      attributes: {
        radius,
        color
      }
    });
  }

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
      case 'ArrowDown':
      case 'KeyS':
        world.actions['fall'] = true;
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
        world.actions['fall'] = false;
        break;
    }
  });

  addEventListener("mousedown", ev => {
    world.actions["fire"] = true;
  })

  addEventListener("mousemove", ev => {
    world.pointerPos = new Vector(ev.clientX, ev.clientY);
  });
}