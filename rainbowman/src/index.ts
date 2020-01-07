import v from "./vector.js";
import { tick } from "./rainbowman.js";
import { World, Point } from "./world.js";
import { initWorld } from "./init.js";
import { redraw } from "./render.js";

function bindClientEvents(world: World, ctx: CanvasRenderingContext2D) {  
  setInterval(() => tick(world), world.tickDuration);
  setInterval(() => redraw(world, ctx), world.tickDuration);

  let getActionNameByCode = (code: string) => {
    switch(code) {
      case "ArrowLeft":
      case "KeyA":        
        return "left";

      case "ArrowRight": 
      case "KeyD": 
        return "right";

      case "ArrowUp":
      case "KeyW":
        return "jump";
        
      case "ArrowDown":
      case "KeyS":
        return "fall";
    }
  }

  addEventListener("keydown", ev => {
    const actionName = getActionNameByCode(ev.code);

    if(actionName) {
      world.actionsLog.push({
        id: "dude1",
        startTime: new Date(),
        name: actionName
      });
    }
  });

  addEventListener("keyup", ev => {
    const actionName = getActionNameByCode(ev.code);

    if(actionName) {
      world.actionsLog.push({
        id: "dude1",
        endTime: new Date(),
        name: actionName
      });
    }
  });

  addEventListener("mousedown", _ => {
    world.actionsLog.push({
      id: "dude1",
      startTime: new Date(),
      name: "fire"
    });
  });

  addEventListener("mouseup", _ => {
    world.actionsLog.push({
      id: "dude1",
      endTime: new Date(),
      name: "fire"
    }); 
  });

  addEventListener("mousemove", ev => {
    let last = world.actionsLog[world.actionsLog.length - 1];
    let cameraPoint = world.points.get("maincamera") as Point 
    let pointerWorldPos = new v(
      ev.clientX + cameraPoint.pos().x, 
      ev.clientY + cameraPoint.pos().y);

    if(last && last.name == "pointerposchange") {
      last.pos = pointerWorldPos; 
    }
    else {
      world.actionsLog.push({
        id: "dude1",
        startTime: new Date(),
        name: "pointerposchange",
        pos: pointerWorldPos
      });
    }
  });
}

export function rainbowman(canvas: HTMLCanvasElement) {
  let ctx = canvas.getContext("2d");
  let world = initWorld(canvas.width, canvas.height);

  bindClientEvents(world, ctx as CanvasRenderingContext2D);
}