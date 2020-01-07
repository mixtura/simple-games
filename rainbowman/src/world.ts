import Vector from "./vector.js"
import {Exact} from "./utilities.js"

export class Point {
  constructor(
    pos: Vector, 
    localPos = Vector.zero, 
    direction = Vector.zero) {
    
    this.pos = pos;
    this.localPos = localPos;
    this.direction = direction;
  }

  pos: Vector;
  localPos: Vector;
  direction: Vector;
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
  fireTime: number
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
  actions: Set<string>,
  platforms: Array<Platform>,
  points: Map<string, Point>,
  bodies: Map<string, Body>,
  colliders: Map<string, CircleCollider[]>,
  attributes: Map<string, {}>
}

export function worldFactory(tickDuration: number) : World {
  return {
    pointerPos: Vector.zero,
    tickDuration: tickDuration,
    connections: new Map<string, string>(),
    actions: new Set<string>(),
    platforms: [],
    points: new Map<string, Point>(),
    bodies: new Map<string, Body>(),
    colliders: new Map<string, CircleCollider[]>(),
    attributes: new Map<string, {}>()
  };
}

export function attach(id: string, parentId: string, connections: Map<string, string>) {
  connections.set(id, parentId);
}

export function detach(id: string, connections: Map<string, string>) {  
  connections.delete(id);
}

export function toScreenPos(worldShift: Vector, pos: Vector) {
  return pos.subtract(worldShift);
}

export function toWorldPos(worldShift: Vector, pos: Vector) {
  return pos.add(worldShift);
}

export function isOnScreen(worldShift: Vector, camAttr: CameraAttributes, pos: Vector) {
  let posInScreenCoordinates = toScreenPos(worldShift, pos);
  
  return ( 
    posInScreenCoordinates.x > camAttr.width ||
    posInScreenCoordinates.x < 0 ||
    posInScreenCoordinates.y > camAttr.height ||
    posInScreenCoordinates.y < 0
  );
}

export function mapEntity<T extends EntityShape>(world: World, entity: Exact<EntityShape, T>) {
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

export function selectEntity<T extends EntityShape>(id: string, world: World) : T {
  return <T>{
    id: id,
    point: world.points.get(id) as Point,
    colliders: world.colliders.get(id),
    body: world.bodies.get(id),
    attributes: world.attributes.get(id)
  };
}