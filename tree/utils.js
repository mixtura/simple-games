function Vector(x, y) {
  this.x = x;
  this.y = y;
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