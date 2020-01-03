import v from "./vector.js";
import {
  Point, 
  Body, 
  CircleCollider, 
  mapEntity, 
  selectEntity, 
  toScreenPos} 
from "./world.js";

function simulate(points, bodies, colliders, platforms, tickDuration) {
  for(let id of Object.keys(bodies).filter(k => bodies[k])) {    
    let point = points[id];
    let body = bodies[id];
    let collidersToCheck = colliders[id] || [];
    let pointOnPlatform = onPlatform(platforms, point.pos, collidersToCheck);    
    let newVelocity = simulateGravity(body.velocity, body.dragFactor, tickDuration);
    
    if(newVelocity.y > 0 && pointOnPlatform) {
      newVelocity.y = -body.bounceFactor * body.velocity.y;
    }
    
    point.pos = point.pos.add(newVelocity);
    body.velocity = newVelocity;    
  }
}

function simulateGravity(velocity, dragFactor, tickDuration) {
  let pixelsInMeter = 80;

  return v.up
    .multiply((9.81 / 10000) * tickDuration * pixelsInMeter)
    .add(velocity.multiply(dragFactor));
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

function updateGunDirection(dudePoint, gunPoint, cameraPoint, pointerPos) {
  let dudeScreenPos = toScreenPos(cameraPoint.pos, dudePoint.pos);
  let dir = pointerPos
    .subtract(dudeScreenPos)
    .normalize();

  gunPoint.direction = dir;
}

function updateCamera(ctx, cameraEntity, points) {
  let point = cameraEntity.point;
  let cameraAttrs = cameraEntity.attributes;
  let currentPos = point.pos;
  
  let targetPos = points[cameraAttrs.targetId].pos
    .add(point.localPos);
  
  let translateVec = currentPos
    .subtract(targetPos)
    .multiply(cameraAttrs.smoothness);
  
  point.pos = currentPos.subtract(translateVec);

  ctx.translate(translateVec.x, translateVec.y); 
}

function spawnBall(world, pos) {
  let id = "ball" + Date.now();

  mapEntity(id, world, {
    point: new Point(new v(pos.x, pos.y), new v(0, 0), v.zero),
    colliders: [new CircleCollider(id + "-collider", 10)],
    body: new Body(10, v.zero, 0.98, 0.7),
    attributes: { radius: 10 },
  });

  return id;
}

function flashCanvas(ctx, cameraEntity) {  
  let cameraPos = cameraEntity.point.pos;

  ctx.fillStyle = "grey";
  ctx.fillRect(
    cameraPos.x, 
    cameraPos.y, 
    cameraEntity.attributes.width, 
    cameraEntity.attributes.height);
}

function drawGun(ctx, gunEntity, points, connections) {
  let gunStartPos = gunEntity.point.pos;
  let gunPoint = gunEntity.point;
  let gunLength = gunEntity.attributes.length;
  
  if(connections[gunEntity.id]) {    
    let attachedToId = connections[gunEntity.id];
    let attachedToPoint = points[attachedToId];

    gunStartPos = attachedToPoint.pos
      .add(gunPoint.localPos);    
  }

  let gunEndPos = gunStartPos
    .moveAlong(gunPoint.direction, gunLength);

  ctx.strokeStyle = "red";
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
  
  ctx.strokeStyle = "black";
  ctx.lineWidth = 5;

  ctx.beginPath();
  ctx.arc(dudePos.x, dudePos.y, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.stroke();
}

function drawPlatform(ctx, platform) {
  ctx.fillStyle = "black";
  ctx.fillRect(
    platform.pos.x, 
    platform.pos.y, 
    platform.length, 
    10);
}

function drawBall(ctx, ball) {
  let pos = ball.point.pos;
  let radius = ball.attributes.radius;
  
  ctx.strokeStyle = "red";
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.stroke();
}

function dudeController(
  dudeEntity,
  world) {

  let {body, attributes, colliders, point} = dudeEntity;
  let {platforms, actions} = world;
  let {jumpCooldown, fallCooldown, landingTime} = attributes;
  let platform = onPlatform(platforms, point.pos, colliders);

  if(platform && !landingTime) {
    attributes.landingTime = landingTime = new Date();
  }

  if(actions["right"]) {
    body.velocity.x = attributes.runVelocity;
  }

  if(actions["left"]) {
    body.velocity.x = -attributes.runVelocity;
  }

  if(actions["jump"] && platform && (new Date() - landingTime) > jumpCooldown) {    
    body.velocity.y = -(attributes.jumpForce / body.mass);
    
    for(let collider of colliders) {
      collider.bypassPlatforms = {};
    }

    actions["jump"] = false;
    attributes.passPlatform = true;
    attributes.landingTime = null;
  }

  if(actions["fall"] && platform && (new Date() - landingTime) > fallCooldown) {
    for(let collider of colliders) {
      collider.bypassPlatforms[platform.id] = true;
    }
    
    attributes.landingTime = null;
    actions["fall"] = false;    
  } 
  else 
  {
    attributes.passPlatform = false;
  }

  if(actions["fire"]) {
    let ballId = spawnBall(world, point.pos);
    let ballBody = world.bodies[ballId];

    ballBody.velocity = world.points["gun"].direction.multiply(14);

    body.velocity = body.velocity.subtract(ballBody.velocity.multiply(0.1));

    actions["fire"] = false;
  }
}

export function tick(ctx, world) { 
  dudeController(
    selectEntity("dude", world),
    world);

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
  
  updateCamera(ctx, selectEntity("maincamera", world), world.points);

  flashCanvas(ctx, selectEntity("maincamera", world));

  drawDude(ctx, selectEntity("dude", world));
  
  drawGun(ctx, selectEntity("gun", world), world.points, world.connections);

  for(let ballId of Object.keys(world.points).filter(k => k.startsWith("ball"))) {
    drawBall(ctx, selectEntity(ballId, world));
  }

  for(let platform of world.platforms) {
    drawPlatform(ctx, platform);
  }
}