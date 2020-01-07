import Vector from "./vector.js"

export type ActionStart = { startTime: Date }
export type ActionEnd = { endTime: Date }
export type ActionType1 = { id: string, name: "left" | "right" | "jump" | "fall" | "fire" }
export type ActionType2 = { id: string, name: "pointerposchange", pos: Vector }
export type ActionType = ActionType1 | ActionType2
export type Action = (ActionStart | ActionEnd) & ActionType