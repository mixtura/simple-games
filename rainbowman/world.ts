import v from "./vector.js"

export class Point {
  constructor(pos: v, localPos = v.zero, direction = v.zero) {
    this.pos = pos;
    this.localPos = localPos;
    this.direction = direction;
  }

  pos: v;
  localPos: v;
  direction: v;
}

export class Body {
  constructor(
    mass: number, 
    velocity: v, 
    dragFactor: number, 
    bounceFactor = 0) {

    this.mass = mass;
    this.velocity = velocity;
    this.dragFactor = dragFactor;
    this.bounceFactor = bounceFactor;
  }

  mass: number;
  velocity: v;
  dragFactor: number;
  bounceFactor: number;
}

export class Platform {
  constructor(id: string, pos: v, length: number) {
    this.id = id;
    this.pos = pos;
    this.length = length;
  }

  id: string;
  pos: v;
  length: number;
}

export class CircleCollider {
  constructor(
    id: string, 
    radius: number, 
    pos = v.zero, 
    bypassPlatforms = {}) {
    
    this.id = id;
    this.radius = radius;
    this.pos = pos;
    this.bypassPlatforms = bypassPlatforms;
  }

  id: string;
  radius: number;
  pos: v;
  bypassPlatforms: object
}

export interface CameraAttributes {
  scale: number,
  targetId: string,
  smoothness: number,
  width: number,
  height: number
}

export interface DudeAttributes {
  radius: number, 
  jumpForce: number, 
  runVelocity: number, 
  jumpCooldown: number, 
  fallCooldown: number, 
  fireCooldown: number,
  landingTime: number, 
  fireTime: number, 
  passPlatform: boolean
}

export interface GunAttributes {
  length: number;
}

type AttributesType = GunAttributes | DudeAttributes | CameraAttributes;

export interface Entity {
  id: string,
  point: Point,
  body?: Body,
  colliders?: CircleCollider[],
  attributes?: AttributesType
}

export interface World {
  pointerPos: v,
  tickDuration: number,
  connections: Map<string, string>,
  actions: Map<string, boolean>,
  platforms: Array<Platform>,
  points: Map<string, Point>,
  bodies: Map<string, Body>,
  colliders: Map<string, CircleCollider[]>,
  attributes: Map<string, AttributesType>
}

export function worldFactory(tickDuration: number) : World {
  return {
    pointerPos: v.zero,
    tickDuration: tickDuration,
    connections: new Map<string, string>(),
    actions: new Map<string, boolean>(),
    platforms: [],
    points: new Map<string, Point>(),
    bodies: new Map<string, Body>(),
    colliders: new Map<string, CircleCollider[]>(),
    attributes: new Map<string, AttributesType>()
  };
}

export function attach(id: string, parentId: string, connections: Map<string, string>) {
  connections[id] = parentId;
}

export function detach(id: string, connections: Map<string, string>) {  
  connections.delete(id);
}

export function toScreenPos(worldShift: v, pos: v) {
  return pos.subtract(worldShift);
}

export function toWorldPos(worldShift: v, pos: v) {
  return pos.add(worldShift);
}

export function isOnScreen(worldShift: v, camAttr: CameraAttributes, pos: v) {
  let posInScreenCoordinates = toScreenPos(worldShift, pos);
  
  return ( 
    posInScreenCoordinates.x > camAttr.width ||
    posInScreenCoordinates.x < 0 ||
    posInScreenCoordinates.y > camAttr.height ||
    posInScreenCoordinates.y < 0
  );
}

export function mapEntity(world: World, entity: Entity) {
  let id = entity.id;
  
  world.points[id] = entity.point;
  world.bodies[id] = entity.body || {};
  world.colliders[id] = entity.colliders || [];
  world.attributes[id] = entity.attributes || {};
}

export function selectEntity(id: string, world: World): Entity {
  return {
    id: id,
    point: world.points[id],
    colliders: world.colliders[id],
    body: world.bodies[id],
    attributes: world.attributes[id]
  };
}