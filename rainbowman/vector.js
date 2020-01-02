class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  
  add(x, y) {
    [x, y] = this._normalizeArgs(arguments);
  
    return new Vector(this.x + x, this.y + y);
  }
  
  subtract(x, y) {
    [x, y] = this._normalizeArgs(arguments);
    
    return new Vector(this.x - x, this.y - y);
  }
  
  multiply(val) {
    return new Vector(this.x * val, this.y * val);
  }
  
  moveAlong(vec, val) {
    let rotation = Math.atan2(vec.x, vec.y);
  
    return new Vector(
      this.x + Math.sin(rotation) * val, 
      this.y + Math.cos(rotation) * val);
  }

  distance(vecTarget) {
    return Math.sqrt(Math.pow(vecTarget.x - this.x, 2) + Math.pow(vecTarget.y - this.y, 2));
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
  
  _normalizeArgs(args) {
    return args.length == 1 ?
    [args[0].x, args[0].y] :
    [args[0], args[1]];
  }
}
  
Vector.up = new Vector(0, 1);
Vector.down = new Vector(0, -1);
Vector.right = new Vector(1, 0);
Vector.left = new Vector(-1, 0);
Vector.zero = new Vector(0, 0);

function v(x, y) {
  return new Vector(x, y);
}

v.up = Vector.up;
v.down = Vector.down;
v.right = Vector.right;
v.left = Vector.left;
v.zero = Vector.zero;