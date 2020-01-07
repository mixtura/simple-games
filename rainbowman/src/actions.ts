import Vector from "./vector"
import { World } from "./world"

export type ActionStart = { startTime: Date }
export type ActionEnd = { endTime: Date }
export type ActionType1 = { name: "left" | "right" | "jump" | "fall" | "fire" }
export type ActionType2 = { name: "pointerposchange", dir: Vector }
export type ActionType = ActionType1 | ActionType2
export type Action = (ActionStart | ActionEnd) & ActionType

export function processAction(world: World, action: Action) {
  if("endTime" in action) {
    processEndAction(world, action);
  } else {
    processStartAction(world, action);
  }
}

function processEndAction(world: World, action: ActionEnd & ActionType) {
  switch(action.name) {
    case "left": 
      world.actions.delete("left");
      break;
    case "right":
      world.actions.delete("right");
      break;
    case "jump":
      world.actions.delete("jump");
      break; 
    case "fall":
      world.actions.delete("fall");
      world.actions.delete("fallen");
      break;
  }
}

function processStartAction(world: World, action: ActionStart & ActionType) {
  switch(action.name) {
    case "left":
      world.actions.add("left");
      world.actions.delete("right");
      break;
  
    case "right":      
      world.actions.delete("left");
      world.actions.add("right");
      break;
  
    case "jump":      
      world.actions.add("jump"); 
      break;
  
    case "fall":
      world.actions.add("fall");
      break;
    
    case "fire":
      world.actions.add("fire");
      break;
    
    case "pointerposchange":
      world.pointerPos = action.dir;
      break;
  }
}