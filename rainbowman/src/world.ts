import Vector from "./vector.js"
import {Exact} from "./utilities.js"
import {Action} from "./actions.js"

export type Id = string 
export type IdToComponentMap<T> = { [K in Id]: T | undefined }

export interface Serializable {
  freeze() : Object;
  thaw() : Object;
}

export class Point {
  constructor( 
    localPos = Vector.zero, 
    direction = Vector.zero) {
    
    this.originPos = Vector.zero;
    this.localPos = localPos;
    this.direction = direction;
  }

  originPos: Vector;
  localPos: Vector;
  direction: Vector;

  pos() {
    return this.originPos.add(this.localPos);
  }
}

export class Body {
  constructor(
    mass: number, 
    velocity: Vector, 
    dragFactor: number, 
    bounceFactor = 0) {

    this.mass = mass;
    this.velocity = velocity;
    this.dragFactor = dragFactor;
    this.bounceFactor = bounceFactor;
  }

  mass: number;
  velocity: Vector;
  dragFactor: number;
  bounceFactor: number;
}

export class Platform {
  constructor(
    id: string, 
    pos: Vector, 
    length: number) {
    
    this.id = id;
    this.pos = pos;
    this.length = length;
  }

  id: string;
  pos: Vector;
  length: number;
}

export class CircleCollider {
  constructor(
    id: string, 
    radius: number, 
    pos = Vector.zero) {
    
    this.id = id;
    this.radius = radius;
    this.pos = pos;
    this.bypassPlatforms = new Set<string>();
  }

  id: string;
  radius: number;
  pos: Vector;
  bypassPlatforms: Set<string>
}

export type CameraAttributes = {
  scale: number,
  targetId: string,
  smoothness: number,
  width: number,
  height: number,
  shift: Vector
}

export type DudeAttributes = {
  radius: number, 
  jumpForce: number, 
  runVelocity: number, 
  jumpCooldown: number, 
  fallCooldown: number, 
  fireCooldown: number,
  landingTime: number, 
  fireTime: number,
  state: Set<string>
  currentGunId: string;
}

export type GunAttributes = { length: number; }
export type BallAttributes = { radius: number }

export type SimpleEntity = {
  id: string
  point: Point  
}

export type HasBody = { body: Body }
export type HasColliders = { colliders: CircleCollider[] }
export type HasAttributes<AttrsT> = { attributes: AttrsT }

export type DudeEntityShape = 
  SimpleEntity & HasBody & HasColliders & HasAttributes<DudeAttributes>
export type GunEntityShape = 
  SimpleEntity & HasAttributes<GunAttributes>
export type BallEntityShape = 
  SimpleEntity & HasColliders & HasBody & HasAttributes<BallAttributes>
export type CameraEntityShape = 
  SimpleEntity & HasAttributes<CameraAttributes>
export type EntityShape = 
  DudeEntityShape | GunEntityShape | BallEntityShape | CameraEntityShape

export type World = {
  pointerPos: Vector,
  tickDuration: number,
  connections: IdToComponentMap<string>,
  platforms: Platform[],
  points: IdToComponentMap<Point>,
  bodies: IdToComponentMap<Body>,
  colliders: IdToComponentMap<CircleCollider[]>,
  attributes: IdToComponentMap<{}>
  actionsLog: Action[]
}

export function worldFactory(tickDuration: number) : World {
  return {
    pointerPos: Vector.zero,
    tickDuration: tickDuration,
    connections: {},
    platforms: [],
    points: {},
    bodies: {},
    colliders: {},
    attributes: {},
    actionsLog: []
  };
}

export function attach(
  id: string, 
  parentId: string,
  points: IdToComponentMap<Point>, 
  connections: IdToComponentMap<string>) {
  
  let point = points[id];
  let parentPoint = points[parentId]
  
  if(point && parentPoint) {
    point.originPos = parentPoint.localPos;
    connections[id] = parentId;
  }
}

export function detach(
  id: string, 
  points: IdToComponentMap<Point>, 
  connections: IdToComponentMap<string>) { 
  
  let point = points[id];
  
  if(point) {
    point.localPos = point.originPos.add(point.localPos);
    point.originPos = Vector.zero;
    
    connections[id] = undefined;
  }
}

export function mapEntity<T extends EntityShape>(
  world: World, 
  entity: Exact<EntityShape, T>) {
  
  let id = entity.id;
  
  world.points[id] = entity.point;

  if("colliders" in entity) {
    world.colliders[id] = entity.colliders;
  }

  if("body" in entity) {    
    world.bodies[id] = entity.body;
  }

  if("attributes" in entity) {
    world.attributes[id] = entity.attributes;
  }
}

export function selectEntity<T extends EntityShape>(
  id: string, 
  world: World) : T {
  
  return <T>{
    id: id,
    point: world.points[id] as Point,
    colliders: world.colliders[id],
    body: world.bodies[id],
    attributes: world.attributes[id]
  };
}

export function selectEntities<T extends EntityShape>(
  idPefix: string, 
  world: World) : T[] {
  
  return Array.from(Object.keys(world.points))
    .filter(k => k.startsWith(idPefix))
    .map(id => selectEntity<T>(id, world));
}