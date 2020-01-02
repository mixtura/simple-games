function bindEvents(world, ctx) {  
  setInterval(() => tick(ctx, world), world.tickDuration);
  
  addEventListener("keydown", ev => {
    switch(ev.code) {
      case "ArrowLeft":
      case "KeyA":        
        world.actions["right"] = false; 
        world.actions["left"] = true;
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

  addEventListener("mousedown", ev => {
    world.actions["fire"] = true;
  });
  
  addEventListener("mouseup", ev => {
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
    point: new Point("maincamera-point", v(0, 0), v(-canvas.width/2, -canvas.height/2)),
    attributes: {
      scale: 1,
      targetId: "dude-point",
      smoothness: 0.05,
      width: canvas.width,
      height: canvas.height
    }
  });

  mapEntity("dude", world, {
    point: new Point("dude-point", v(0, 0), v.zero, v.right),
    body: new Body("dude-body", 50, v.zero, 0.98),
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
    point: new Point("gun-point", v(0, 0), v.zero, v.right),
    attributes: {
      length: 20
    }
  });

  attach(world.points["gun"], world.points["dude"], world.connections);

  return world;
}

function rainbowman(canvas) {
  let ctx = canvas.getContext("2d");
  let world = initWorld();

  bindEvents(world, ctx);
}