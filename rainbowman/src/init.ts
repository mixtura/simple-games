import v from "./vector.js"
import { 
  Point, 
  Body,
  CircleCollider, 
  Platform, 
  worldFactory, 
  mapEntity, 
  attach 
} from "./world.js";

export function initWorld(width: number, height: number) {
  let world = worldFactory(1);
  
  world.platforms = [
    new Platform("platform-1", new v(0, 300), 300),
    new Platform("platform-2", new v(100, 400), 700),
    new Platform("platform-3", new v(0, 500), 500),
    new Platform("platform-4", new v(300, 600), 400)
  ];
  
  mapEntity(world, {
    id: "maincamera",
    point: new Point(),
    attributes: {
      scale: 1,
      targetId: "dude1",
      smoothness: 0.05,
      width,
      height,
      shift: new v(-width/2, -height/2)
    }
  });
  
  mapEntity(world, {
    id: "dude1",
    point: new Point(v.zero, v.right),
    body: new Body(50, v.zero, 0.98),
    colliders: [
      new CircleCollider("dude-collider-1", 20, v.left.multiply(25)), 
      new CircleCollider("dude-collider-2", 20, v.right.multiply(25))],
    attributes: {
      radius: 20, 
      jumpForce: 350,
      runVelocity: 2.5,
      jumpCooldown: 100,
      fallCooldown: 100,
      fireCooldown: 100,
      landingTime: 0,
      fireTime: 0,
      state: new Set<string>(),
      currentGunId: "gun1"
    }
  });
  
  mapEntity(world, {
    id: "gun1",
    point: new Point(v.zero, v.right),
    attributes: {
      length: 20
    }
  });
  
  attach("gun1", "dude1", world.points, world.connections);
  
  return world;
}