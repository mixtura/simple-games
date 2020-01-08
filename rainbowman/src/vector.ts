export default class Vector {    
  x: number;
  y: number;
  
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  copy(): Vector {
    return new Vector(this.x, this.y);
  }
  
  add(x: number, y: number) : Vector;
  add(vec: Vector) : Vector;
  add(x: number | Vector, y?: number) {
    [x, y] = normalizeArgs(arguments);
  
    return new Vector(this.x + x, this.y + y);
  }
  
  subtract(x: number, y: number) : Vector;
  subtract(vec: Vector) : Vector;
  subtract(x: number | Vector, y?: number) {
    [x, y] = normalizeArgs(arguments);
    
    return new Vector(this.x - x, this.y - y);
  }
  
  multiply(val: number) {
    return new Vector(this.x * val, this.y * val);
  }
  
  moveAlong(vec: Vector, val: number) {
    let rotation = Math.atan2(vec.x, vec.y);
  
    return new Vector(
      this.x + Math.sin(rotation) * val, 
      this.y + Math.cos(rotation) * val);
  }

  distance(vecTarget: Vector) {
    return Math.sqrt(
      Math.pow(vecTarget.x - this.x, 2) + 
      Math.pow(vecTarget.y - this.y, 2));
  }
  
  magnitude() {
    return Math.sqrt(
      this.x * this.x + this.y * this.y);
  }
  
  normalize() {
    let magnitude = this.magnitude();
  
    return new Vector(
      this.x / magnitude, 
      this.y / magnitude);
  }

  public static up = new Vector(0, 1);
  public static down = new Vector(0, -1);
  public static right = new Vector(1, 0);
  public static left = new Vector(-1, 0);
  public static zero = new Vector(0, 0);
}

function normalizeArgs(args: any) : number[] {
  return args.length == 1 
    ? [args[0].x, args[0].y] 
    : [args[0], args[1]];
}