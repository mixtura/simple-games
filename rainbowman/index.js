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
    world.pointerPos = new Vector(ev.clientX, ev.clientY);
  });
}

function initWorld() {
  let world = {
    pointerPos: v.zero,
    tickDuration: 1,
    connections: {},
    actions: {},
    platforms: [
      new Platform("platform-1", v(0, 300), 300),
      new Platform("platform-2", v(100, 400), 700),
      new Platform("platform-3", v(0, 500), 500),
      new Platform("platform-4", v(300, 600), 400)
    ],
    points: {},
    bodies: {},
    colliders: {},
    attributes: {}
  };

  mapEntity("maincamera", world, {
    point: new Point(v.zero, v(-canvas.width/2, -canvas.height/2)),
    attributes: {
      scale: 1,
      targetId: "dude",
      smoothness: 0.05,
      width: canvas.width,
      height: canvas.height
    }
  });

  mapEntity("dude", world, {
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
      fireTime: 0,
      passPlatform: false
    }
  });

  mapEntity("gun", world, {
    point: new Point(v.zero, v.zero, v.right),
    attributes: {
      length: 20
    }
  });

  attach("gun", "dude", world.connections);

  return world;
}

function rainbowman(canvas) {
  let ctx = canvas.getContext("2d");
  let world = initWorld();

  bindEvents(world, ctx);
}