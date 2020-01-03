import v from "./vector.js"

export class Point {
  constructor(pos, localPos = v.zero, direction = v.zero) {
    this.pos = pos;
    this.localPos = localPos;
    this.direction = direction;
  }
}

export class Body {
  constructor(mass, velocity, dragFactor, bounceFactor = 0) {
    this.mass = mass;
    this.velocity = velocity;
    this.dragFactor = dragFactor;
    this.bounceFactor = bounceFactor;
  }
}

export class Platform {
  constructor(id, pos, length) {
    this.id = id;
    this.pos = pos;
    this.length = length;
  }
}

export class CircleCollider {
  constructor(id, radius, pos = v.zero, bypassPlatforms = {}) {
    this.id = id;
    this.radius = radius;
    this.pos = pos;
    this.bypassPlatforms = bypassPlatforms;
  }
}

export class CameraAttributes {
  constructor({
    scale,
    targetId,
    smoothness,
    width,
    height}) {

    this.scale = scale;
    this.targetId = targetId;
    this.smoothness = smoothness;
    this.width = width;
    this.height = height
  }
}

export class DudeAttributes {
  constructor({
    radius, 
    jumpForce, 
    runVelocity, 
    jumpCooldown, 
    fallCooldown, 
    fireCooldown,
    landingTime = 0, 
    fireTime = 0, 
    passPlatform = false}) {

    this.radius = radius;
    this.jumpForce = jumpForce;
    this.runVelocity = runVelocity;
    this.jumpCooldown = jumpCooldown;
    this.fallCooldown = fallCooldown;
    this.fireCooldown = fireCooldown;
    this.landingTime = landingTime;
    this.fireTime = fireTime;
    this.passPlatform = passPlatform;
  }
}

export class GunAttributes {
  constructor({length}) {
    this.length = length;
  }
}

export class World {
  constructor({
    pointerPos = v.zero,
    tickDuration = 1,
    connections = {},
    actions = {},
    platforms = [],
    points = {},
    bodies = {},
    colliders = {},
    attributes = {}
  }) {
    this.pointerPos = pointerPos;
    this.tickDuration = tickDuration;
    this.connections = connections;
    this.actions = actions;
    this.platforms = platforms;
    this.points = points;
    this.bodies = bodies;
    this.colliders = colliders;
    this.attributes = attributes;
  }
}

export function attach(id, parentId, connections) {
  connections[id] = parentId;
}

export function detach(id, connections) {  
  connections[id] = null;
}

export function toScreenPos(worldShift, pos) {
  return pos.subtract(worldShift);
}

export function toWorldPos(worldShift, pos) {
  return pos.add(worldShift);
}

export function isOnScreen(worldShift, pos) {
  let posInScreenCoordinates = toScreenPos(worldShift, pos);
  let camAttr = camera.attributes;

  return ( 
    posInScreenCoordinates.x > camAttr.width ||
    posInScreenCoordinates.x < 0 ||
    posInScreenCoordinates.y > camAttr.height ||
    posInScreenCoordinates.y < 0
  );
}

export function mapEntity(id, world, entityDesc) {
  world.points[id] = entityDesc.point;
  world.bodies[id] = entityDesc.body;
  world.colliders[id] = entityDesc.colliders;
  world.attributes[id] = entityDesc.attributes;
}

export function selectEntity(id, world) {
  return {
    id: id,
    point: world.points[id],
    colliders: world.colliders[id],
    attributes: world.attributes[id],
    body: world.bodies[id],
  };
}
