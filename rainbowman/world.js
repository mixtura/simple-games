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