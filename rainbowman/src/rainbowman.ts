import v from "./vector.js";
import {
  World,
  Point, 
  Body, 
  CircleCollider, 
  Platform,
  DudeEntityShape, 
  mapEntity, 
  selectEntities,
  DudeAttributes,
  IdToComponentMap
} from "./world.js";

import { 
  ActionStart, 
  ActionType, 
  ActionEnd, 
  Action 
} from "./actions.js";

function simulate(
  points: IdToComponentMap<Point>, 
  bodies: IdToComponentMap<Body>, 
  colliders: IdToComponentMap<CircleCollider[]>, 
  platforms: Platform[], 
  tickDuration: number) {
  
  for(let id of Object.keys(bodies)) {    
    let point = points[id] as Point;
    let body = bodies[id] as Body;
    let collidersToCheck = colliders[id] || [];
    let pointOnPlatform = onPlatform(point.pos(), platforms, collidersToCheck);    
    let newVelocity = simulateGravity(body.velocity, body.dragFactor, tickDuration);
    
    if(newVelocity.y > 0 && pointOnPlatform) {
      newVelocity.y = -body.bounceFactor * body.velocity.y * tickDuration;
    }
    
    point.localPos = point.localPos.add(newVelocity);
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

function spawnBall(world: World, pos: v, radius: number) {
  const id = "ball" + Date.now();

  mapEntity(world, {
    id,
    point: new Point(pos.copy(), v.zero),
    colliders: [new CircleCollider(id + "-collider", radius)],
    body: new Body(10, v.zero, 0.98, 0.7),
    attributes: { radius }
  });

  return id;
}

function updatePoints(
  points: IdToComponentMap<Point>,
  connections: IdToComponentMap<string>) {

  for(let [connectedId, connectedToId] of Object.entries(connections)) {
    let connectedPoint = points[connectedId] as Point;
    let connectedToPoint = points[connectedToId as string] as Point;

    connectedPoint.originPos = connectedToPoint.localPos;
  }
}

function dudeController(
  world: World,
  dudeEntity: DudeEntityShape,
  gunPoint?: Point) {

  let {attributes, colliders, point, body} = dudeEntity;
  let {state} = attributes;
  let {platforms} = world;
  let {jumpCooldown, fallCooldown, landingTime} = attributes;
  let platform = onPlatform(point.pos(), platforms, colliders);

  if(state.has("right")) {
    body.velocity.x = attributes.runVelocity;
  }

  if(state.has("left")) {
    body.velocity.x = -attributes.runVelocity;
  }

  if(state.has("fire") && gunPoint) {
    let ballId = spawnBall(world, point.pos(), 5);
    let ballBody = world.bodies[ballId] as Body;

    ballBody.velocity = gunPoint.direction.multiply(14);

    body.velocity = body.velocity.subtract(ballBody.velocity.multiply(0.1));

    state.delete("fire");
  }

  if(platform) {    
    let now = (new Date()).valueOf();

    if(landingTime === 0) {
      attributes.landingTime = landingTime = now;
    }

    if(state.has("jump") && (now - landingTime) > jumpCooldown) {    
      body.velocity.y = -(attributes.jumpForce / body.mass);
      
      for(let collider of colliders) {
        collider.bypassPlatforms.clear();
      }
  
      attributes.landingTime = 0;
      state.delete("jump");
    }
  
    if(state.has("fall") && !state.has("fallen") && (now - landingTime) > fallCooldown) {
      for(let collider of colliders) {
        collider.bypassPlatforms.add(platform.id);
      }
  
      attributes.landingTime = 0;
      state.delete("fall");
      state.add("fallen");
    }
  }
}

export function tick(world: World) {
  let dudeEntities = selectEntities<DudeEntityShape>("dude", world);

  for(let dude of dudeEntities) {
    let gunId = dude.attributes.currentGunId;
    let gunPoint = world.points[gunId];

    for(let action of world.actionsLog.filter(v => v.id == dude.id)) {
      applyAction(action, dude.attributes, gunPoint);
    }
  
    dudeController(world, dude, gunPoint);
  }

  world.actionsLog = [];

  updatePoints(
    world.points, 
    world.connections);

  simulate(
    world.points, 
    world.bodies,
    world.colliders,
    world.platforms, 
    world.tickDuration);
}

function applyAction(
  action: Action,
  attributes: DudeAttributes,
  gunPoint?: Point) { 
  
  if(gunPoint && action.name == "pointerposchange") {
    gunPoint.direction = action.pos
      .subtract(gunPoint.pos())
      .normalize(); 
  }
  else if("endTime" in action) {
    applyEndAction(attributes, action);
  } 
  else {
    applyStartAction(attributes, action);
  }
}

function applyEndAction(
  attributes: DudeAttributes, 
  action: ActionEnd & ActionType) {
  
  switch(action.name) {
    case "left": 
    case "right":
    case "jump":
    case "fire":
      attributes.state.delete(action.name);
      break;

    case "fall":
      attributes.state.delete("fall");
      attributes.state.delete("fallen");
      break;
  }
}

function applyStartAction(
  attributes: DudeAttributes, 
  action: ActionStart & ActionType) {
  
  switch(action.name) {
    case "left":
      attributes.state.add("left");
      attributes.state.delete("right");
      break;
  
    case "right":      
      attributes.state.delete("left");
      attributes.state.add("right");
      break;

    case "jump":  
    case "fall":
    case "fire":
      attributes.state.add(action.name);
      break;
  }
}