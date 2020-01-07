import v from "./vector.js";
import { tick } from "./rainbowman.js";
import { World } from "./world.js";
import { initWorld } from "./init";
import { processAction } from "./actions.js";

function bindClientEvents(world: World, ctx: CanvasRenderingContext2D) {  
  setInterval(() => tick(ctx, world), world.tickDuration);

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
      processAction(world, {
        startTime: new Date(),
        name: actionName
      });
    }
  });

  addEventListener("keyup", ev => {
    const actionName = getActionNameByCode(ev.code);

    if(actionName) {
      processAction(world, {
        endTime: new Date(),
        name: actionName
      });
    }
  });

  addEventListener("mousedown", _ => {
    processAction(world, {
      startTime: new Date(),
      name: "fire"
    });
  });

  addEventListener("mouseup", _ => {
    processAction(world, {
      endTime: new Date(),
      name: "fire"
    }); 
  });

  addEventListener("mousemove", ev => {
    processAction(world, {
      startTime: new Date(),
      name: "pointerposchange",
      dir: new v(ev.clientX, ev.clientY)
    });
  });
}

export function rainbowman(canvas: HTMLCanvasElement) {
  let ctx = canvas.getContext("2d");
  let world = initWorld(canvas.width, canvas.height);

  bindClientEvents(world, ctx as CanvasRenderingContext2D);
}