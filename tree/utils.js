function Vector(x, y) {
  this.x = x;
  this.y = y;
}

function getRandWithVariant(base, variant) {
  return getRandBetween(base - variant, base + variant);
}

function getRandBetween(min, max) {
  return Math.random() * (max - min) + min;
}