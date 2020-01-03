class Point {
  constructor(pos, localPos = v.zero, direction = v.zero) {
    this.pos = pos;
    this.localPos = localPos;
    this.direction = direction;
  }
}

class Body {
  constructor(mass, velocity, dragFactor, bounceFactor = 0) {
    this.mass = mass;
    this.velocity = velocity;
    this.dragFactor = dragFactor;
    this.bounceFactor = bounceFactor;
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

function attach(id, parentId, connections) {
  connections[id] = parentId;
}

function detach(id, connections) {  
  connections[id] = null;
}

function toScreenPos(worldShift, pos) {
  return pos.subtract(worldShift);
}

function toWorldPos(worldShift, pos) {
  return pos.add(worldShift);
}

function isOnScreen(worldShift, pos) {
  let posInScreenCoordinates = toScreenPos(worldShift, pos);
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
  world.bodies[id] = entityDesc.body;
  world.colliders[id] = entityDesc.colliders;
  world.attributes[id] = entityDesc.attributes;
}

function selectEntity(id, world) {
  return {
    id: id,
    point: world.points[id],
    colliders: world.colliders[id],
    attributes: world.attributes[id],
    body: world.bodies[id],
  };
}
