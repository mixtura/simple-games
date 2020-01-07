import v from "./vector.js";
import {
  World,
  Point, 
  Body, 
  CircleCollider, 
  Platform,
  GunEntityShape,
  DudeEntityShape,
  CameraEntityShape,
  BallEntityShape, 
  mapEntity, 
  selectEntity, 
  toScreenPos,
} from "./world.js";

function simulate(
  points: Map<string, Point>, 
  bodies: Map<string, Body>, 
  colliders: Map<string, CircleCollider[]>, 
  platforms: Platform[], 
  tickDuration: number) {
  
  for(let id of bodies.keys()) {    
    let point = points.get(id) as Point;
    let body = bodies.get(id) as Body;
    let collidersToCheck = colliders.get(id) || [];
    let pointOnPlatform = onPlatform(point.pos, platforms, collidersToCheck);    
    let newVelocity = simulateGravity(body.velocity, body.dragFactor, tickDuration);
    
    if(newVelocity.y > 0 && pointOnPlatform) {
      newVelocity.y = -body.bounceFactor * body.velocity.y;
    }
    
    point.pos = point.pos.add(newVelocity);
    body.velocity = newVelocity;    
  }
}

function simulateGravity(
  velocity: v, 
  dragFactor: number, 
  tickDuration: number) {
  
  let pixelsInMeter = 10;

  return v.up
    .multiply(9.81 * (tickDuration / 1000) * pixelsInMeter)
    .add(velocity.multiply(dragFactor));
}

function onPlatform(
  position: v, 
  platforms: Platform[], 
  colliders: CircleCollider[]) {
  
  let checkColliderOnPlatform = (p: Platform) => 
    (c: CircleCollider) => {
      let colliderPos = position.add(c.pos);

      return (
        p.pos.x <= colliderPos.x && 
        p.pos.x >= colliderPos.x - p.length &&
        p.pos.y >= colliderPos.y + c.radius &&
        p.pos.y <= colliderPos.y + c.radius + 5);  
    };

  return platforms
    .find(p => colliders
      .filter(c => !c.bypassPlatforms.has(p.id))
      .some(checkColliderOnPlatform(p)));
}

function updateGunDirection(
  dudePoint: Point, 
  gunPoint: Point, 
  cameraPoint: Point, 
  pointerPos: v) {

  let dudeScreenPos = toScreenPos(
    cameraPoint.pos, dudePoint.pos);
  
  let dir = pointerPos
    .subtract(dudeScreenPos)
    .normalize();

  gunPoint.direction = dir;
}

function spawnBall(world: World, pos: v, radius: number) {
  const id = "ball" + Date.now();

  mapEntity(world, {
    id,
    point: new Point(pos.copy(), v.zero, v.zero),
    colliders: [new CircleCollider(id + "-collider", radius)],
    body: new Body(10, v.zero, 0.98, 0.7),
    attributes: { radius }
  });

  return id;
}

function updateCamera(
  ctx: CanvasRenderingContext2D, 
  cameraEntity: CameraEntityShape, 
  points: Map<string, Point>) {
  
  let point = cameraEntity.point;
  let cameraAttrs = cameraEntity.attributes;
  let currentPos = point.pos;
  let targetPoint = points
    .get(cameraAttrs.targetId) as Point;
  
  let targetPos = targetPoint.pos
    .add(point.localPos);
  
  let translateVec = currentPos
    .subtract(targetPos)
    .multiply(cameraAttrs.smoothness);
  
  point.pos = currentPos.subtract(translateVec);

  ctx.translate(translateVec.x, translateVec.y); 
}

function flashCanvas(
  ctx: CanvasRenderingContext2D, 
  cameraEntity: CameraEntityShape) {  
  
  let cameraPos = cameraEntity.point.pos;

  ctx.fillStyle = "grey";
  ctx.fillRect(
    cameraPos.x, 
    cameraPos.y, 
    cameraEntity.attributes.width, 
    cameraEntity.attributes.height);
}

function drawGun(
  ctx: CanvasRenderingContext2D, 
  gunEntity: GunEntityShape, 
  points: Map<string, Point>, 
  connections: Map<string, string>) {
  
  let gunStartPos = gunEntity.point.pos;
  let gunPoint = gunEntity.point;
  let gunLength = gunEntity.attributes.length;
  let attachedToId = connections.get(gunEntity.id);

  if(attachedToId) {
    let attachedToPoint = points
      .get(attachedToId) as Point;

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

function drawDude(
  ctx: CanvasRenderingContext2D, 
  dudeEntity: DudeEntityShape) {
  
  let dudePos = dudeEntity.point.pos;
  let radius = dudeEntity.attributes.radius;
  
  ctx.strokeStyle = "black";
  ctx.lineWidth = 5;

  ctx.beginPath();
  ctx.arc(dudePos.x, dudePos.y, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.stroke();
}

function drawPlatform(
  ctx: CanvasRenderingContext2D, 
  platform: Platform) {
  
  ctx.fillStyle = "black";
  ctx.fillRect(
    platform.pos.x, 
    platform.pos.y, 
    platform.length, 
    10);
}

function drawBall(
  ctx: CanvasRenderingContext2D, 
  ball: BallEntityShape) {
  
  let pos = ball.point.pos;
  let radius = ball.attributes.radius;
  
  ctx.strokeStyle = "red";
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.stroke();
}

function dudeController(
  dudeEntity: DudeEntityShape,
  world: World) {

  let {attributes, colliders, point, body} = dudeEntity;
  let {platforms, actions} = world;
  let {jumpCooldown, fallCooldown, landingTime} = attributes;
  let platform = onPlatform(point.pos, platforms, colliders);

  if(actions.has("right")) {
    body.velocity.x = attributes.runVelocity;
  }

  if(actions.has("left")) {
    body.velocity.x = -attributes.runVelocity;
  }

  if(actions.has("fire")) {
    let ballId = spawnBall(world, point.pos, 5);
    let ballBody = world.bodies.get(ballId) as Body;
    let gunPoint = world.points.get("gun") as Point;

    ballBody.velocity = gunPoint.direction.multiply(14);

    body.velocity = body.velocity.subtract(ballBody.velocity.multiply(0.1));

    actions.delete("fire");
  }

  if(platform) {    
    let now = (new Date()).valueOf();

    if(landingTime === 0) {
      attributes.landingTime = landingTime = now;
    }

    if(actions.has("jump") && (now - landingTime) > jumpCooldown) {    
      body.velocity.y = -(attributes.jumpForce / body.mass);
      
      for(let collider of colliders) {
        collider.bypassPlatforms.clear();
      }
  
      attributes.landingTime = 0;
      actions.delete("jump");
    }
  
    if(actions.has("fall") && !actions.has("fallen") && (now - landingTime) > fallCooldown) {
      for(let collider of colliders) {
        collider.bypassPlatforms.add(platform.id);
      }
  
      attributes.landingTime = 0;
      actions.delete("fall");
      actions.add("fallen");
    }
  }
}

export function tick(
  ctx: CanvasRenderingContext2D, 
  world: World) { 

  let gunEntity = selectEntity<GunEntityShape>("gun", world);
  let dudeEntity = selectEntity<DudeEntityShape>("dude", world);
  let cameraEntity = selectEntity<CameraEntityShape>("maincamera", world);
  let ballEntities = Array.from(world.points.keys())
    .filter(k => k.startsWith("ball"))
    .map(id => selectEntity<BallEntityShape>(id, world))

  dudeController(dudeEntity, world);

  simulate(
    world.points, 
    world.bodies,
    world.colliders,
    world.platforms, 
    world.tickDuration);

  updateGunDirection(
    dudeEntity.point, 
    gunEntity.point, 
    cameraEntity.point, 
    world.pointerPos);
  
  updateCamera(ctx, cameraEntity, world.points);

  flashCanvas(ctx, cameraEntity);

  drawDude(ctx, dudeEntity);
  
  drawGun(ctx, gunEntity, world.points, world.connections);

  for(let ball of ballEntities) {
    drawBall(ctx, ball);
  }

  for(let platform of world.platforms) {
    drawPlatform(ctx, platform);
  }
}