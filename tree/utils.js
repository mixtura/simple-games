function Vector(x, y) {
  this.x = x;
  this.y = y;
}

Vector.prototype.add = function(vec2) {
  return new Vector(this.x + vec2.x, this.y + vec2.y);  
}

Vector.prototype.subtract = function(vec2) {
  return new Vector(this.x - vec2.x, this.y - vec2.y);
}

Vector.prototype.multiply = function(value) {
  return new Vector(this.x * value, this.y * value);
}

Vector.up = new Vector(0, 1);
Vector.left = new Vector(-1, 0);
Vector.right = new Vector(1, 0);
Vector.down = new Vector(0, -1);

Vector.fromAngle = function(angle) {
  return new Vector(Math.cos(angle), Math.sin(angle));
}

function getRandWithVariantRatio(base, variantRatio) {
  return getRandWithVariant(base, base * variantRatio);
}

function getRandWithVariant(base, variant) {
  return getRandBetween(base, base + variant);
}

function getRandBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function debugRay(ctx, startPos, angle, color) {
  let endPosX = startPos.x + Math.cos(angle) * 20;
  let endPosY = startPos.y + Math.sin(angle) * 20;

  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(startPos.x, startPos.y);
  ctx.lineTo(endPosX, endPosY);
  ctx.stroke();
}