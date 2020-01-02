class Point {
  constructor(id, pos, localPos = v.zero, direction = v.zero) {
    this.id = id;
    this.pos = pos;
    this.localPos = localPos;
    this.direction = direction;
  }
}

class Body {
  constructor(id, mass, velocity, dragFactor, bounceFactor = 0) {
    this.id = id;
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
  world.colliders[id] = entityDesc.colliders;
  world.attributes[id] = entityDesc.attributes;
  world.bodies[id] = entityDesc.body;
}

function selectEntity(id, world) {
  return {
    point: world.points[id],
    colliders: world.colliders[id],
    attributes: world.attributes[id],
    body: world.bodies[id],
  };
}
