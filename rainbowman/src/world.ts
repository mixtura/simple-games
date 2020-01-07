import Vector from "./vector.js"
import {Exact} from "./utilities.js"
import {Action} from "./actions.js"

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

export interface CameraAttributes {
  scale: number,
  targetId: string,
  smoothness: number,
  width: number,
  height: number,
  shift: Vector
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
  state: Set<string>
  currentGunId: string;
}

export interface GunAttributes {
  length: number;
}

export interface BallAttributes {
  radius: number
}

export type SimpleEntity = {
  id: string
  point: Point  
}

export type HasBody = {
  body: Body
}

export type HasAttributes<AttrsT> = {
  attributes: AttrsT
}

export type HasColliders = {
  colliders: CircleCollider[]
}

export type DudeEntityShape = SimpleEntity & HasBody & HasColliders & HasAttributes<DudeAttributes>
export type GunEntityShape = SimpleEntity & HasAttributes<GunAttributes>
export type BallEntityShape = SimpleEntity & HasColliders & HasBody & HasAttributes<BallAttributes>
export type CameraEntityShape = SimpleEntity & HasAttributes<CameraAttributes>
export type EntityShape = DudeEntityShape | GunEntityShape | BallEntityShape | CameraEntityShape

export interface World {
  pointerPos: Vector,
  tickDuration: number,
  connections: Map<string, string>,
  platforms: Array<Platform>,
  points: Map<string, Point>,
  bodies: Map<string, Body>,
  colliders: Map<string, CircleCollider[]>,
  attributes: Map<string, {}>
  actionsLog: Action[]
}

export function worldFactory(tickDuration: number) : World {
  return {
    pointerPos: Vector.zero,
    tickDuration: tickDuration,
    connections: new Map<string, string>(),
    platforms: [],
    points: new Map<string, Point>(),
    bodies: new Map<string, Body>(),
    colliders: new Map<string, CircleCollider[]>(),
    attributes: new Map<string, {}>(),
    actionsLog: []
  };
}

export function attach(
  id: string, 
  parentId: string,
  points: Map<string, Point>, 
  connections: Map<string, string>) {
  
  let point = points.get(id);
  let parentPoint = points.get(parentId)
  
  if(point && parentPoint) {
    point.originPos = parentPoint.localPos;
    connections.set(id, parentId);
  }
}

export function detach(
  id: string, 
  points: Map<string, Point>, 
  connections: Map<string, string>) { 
  
  let point = points.get(id);
  
  if(point) {
    point.localPos = point.originPos.add(point.localPos);
    point.originPos = Vector.zero;
    connections.delete(id);
  }
}

export function mapEntity<T extends EntityShape>(
  world: World, 
  entity: Exact<EntityShape, T>) {
  
  let id = entity.id;
  
  world.points.set(id, entity.point);

  if("colliders" in entity) {
    world.colliders.set(id, entity.colliders);
  }

  if("body" in entity) {    
    world.bodies.set(id, entity.body);
  }

  if("attributes" in entity) {
    world.attributes.set(id, entity.attributes);
  }
}

export function selectEntity<T extends EntityShape>(
  id: string, 
  world: World) : T {
  
  return <T>{
    id: id,
    point: world.points.get(id) as Point,
    colliders: world.colliders.get(id),
    body: world.bodies.get(id),
    attributes: world.attributes.get(id)
  };
}

export function selectEntities<T extends EntityShape>(
  idPefix: string, 
  world: World) : T[] {
  
  return Array.from(world.points.keys())
    .filter(k => k.startsWith(idPefix))
    .map(id => selectEntity<T>(id, world));
}