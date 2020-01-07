import v from "./vector"
import { 
  Point, 
  Body,
  CircleCollider, 
  Platform, 
  worldFactory, 
  mapEntity, 
  attach 
} from "./world";

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
    point: new Point(v.zero, new v(-width/2, -height/2)),
    attributes: {
    scale: 1,
    targetId: "dude",
    smoothness: 0.05,
    width,
    height
    }
  });
  
  mapEntity(world, {
    id: "dude",
    point: new Point(v.zero, v.zero, v.right),
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
    fireTime: 0
    }
  });
  
  mapEntity(world, {
    id: "gun",
    point: new Point(v.zero, v.zero, v.right),
    attributes: {
    length: 20
    }
  });
  
  attach("gun", "dude", world.connections);
  
  return world;
}