import v from "./vector.js";
import {tick} from "./rainbowman.js";
import {
  Point, 
  Body, 
  Platform, 
  CircleCollider, 
  DudeAttributes,
  CameraAttributes,
  GunAttributes,
  World,
  attach, 
  mapEntity} 
from "./world.js";

function bindEvents(world, ctx) {  
  setInterval(() => tick(ctx, world), world.tickDuration);
  
  addEventListener("keydown", ev => {
    switch(ev.code) {
      case "ArrowLeft":
      case "KeyA":        
        world.actions["left"] = true;
        world.actions["right"] = false; 
        break;
      case "ArrowRight": 
      case "KeyD":
        world.actions["left"] = false;
        world.actions["right"] = true;
        break;
      case "ArrowUp":
      case "KeyW":
        world.actions["jump"] = true;
        break; 
      case "ArrowDown":
      case "KeyS":
        world.actions["fall"] = true;
        break;
    }
  });

  addEventListener("keyup", ev => {
    switch(ev.code) {
      case "ArrowLeft":
      case "KeyA": 
        world.actions["left"] = false;
        break;
      case "ArrowRight": 
      case "KeyD":
        world.actions["right"] = false;
        break;
      case "ArrowUp":
      case "KeyW":
        world.actions["jump"] = false;
        break; 
      case "ArrowDown":
      case "KeyS":
        world.actions["fall"] = false;
        break;
    }
  });

  addEventListener("mousedown", _ => {
    world.actions["fire"] = true;
  });
  
  addEventListener("mouseup", _ => {
    world.actions["fire"] = false;
  });

  addEventListener("mousemove", ev => {
    world.pointerPos = new v(ev.clientX, ev.clientY);
  });
}

function initWorld() {
  let world = new World({
    pointerPos: v.zero,
    tickDuration: 1,
    platforms: [
      new Platform("platform-1", new v(0, 300), 300),
      new Platform("platform-2", new v(100, 400), 700),
      new Platform("platform-3", new v(0, 500), 500),
      new Platform("platform-4", new v(300, 600), 400)
    ]
  });

  mapEntity("maincamera", world, {
    point: new Point(v.zero, new v(-canvas.width/2, -canvas.height/2)),
    attributes: new CameraAttributes({
      scale: 1,
      targetId: "dude",
      smoothness: 0.05,
      width: canvas.width,
      height: canvas.height
    })
  });

  mapEntity("dude", world, {
    point: new Point(v.zero, v.zero, v.right),
    body: new Body(50, v.zero, 0.98),
    colliders: [
      new CircleCollider("dude-collider-1", 20, v.left.multiply(25)), 
      new CircleCollider("dude-collider-2", 20, v.right.multiply(25))],
    attributes: new DudeAttributes({
      radius: 20, 
      jumpForce: 350,
      runVelocity: 2.5,
      jumpCooldown: 100,
      fallCooldown: 100,
      fireCooldown: 100
    })
  });

  mapEntity("gun", world, {
    point: new Point(v.zero, v.zero, v.right),
    attributes: new GunAttributes({
      length: 20
    })
  });

  attach("gun", "dude", world.connections);

  return world;
}

export function rainbowman(canvas) {
  let ctx = canvas.getContext("2d");
  let world = initWorld();

  bindEvents(world, ctx);
}