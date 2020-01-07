import { 
  CameraEntityShape, 
  GunEntityShape, 
  DudeEntityShape, 
  Platform, 
  BallEntityShape, 
  World,
  selectEntities,
  selectEntity,
  Point
} from "./world.js";

export function redraw(world: World, ctx: CanvasRenderingContext2D) {
  let gunEntities = selectEntities<GunEntityShape>("gun", world);
  let dudeEntities = selectEntities<DudeEntityShape>("dude", world);
  let ballEntities = selectEntities<BallEntityShape>("ball", world);
  let cameraEntity = selectEntity<CameraEntityShape>("maincamera", world);

  updateCamera(ctx, cameraEntity, world.points);
  flashCanvas(ctx, cameraEntity);

  for(let dude of dudeEntities) {
    drawDude(ctx, dude);
  }
  
  for(let gun of gunEntities) {
    drawGun(ctx, gun);
  }

  for(let ball of ballEntities) {
    drawBall(ctx, ball);
  }

  for(let platform of world.platforms) {
    drawPlatform(ctx, platform);
  }
}

function updateCamera(
  ctx: CanvasRenderingContext2D, 
  cameraEntity: CameraEntityShape, 
  points: Map<string, Point>) {
  
  let point = cameraEntity.point;
  let cameraAttrs = cameraEntity.attributes;
  let currentPos = point.localPos;
  let targetPoint = points
    .get(cameraAttrs.targetId) as Point;
  
  let targetPos = targetPoint
    .pos()
    .add(cameraAttrs.shift);
  
  let translateVec = currentPos
    .subtract(targetPos)
    .multiply(cameraAttrs.smoothness);
  
  point.localPos = currentPos.subtract(translateVec);

  ctx.translate(translateVec.x, translateVec.y); 
}

function flashCanvas(
  ctx: CanvasRenderingContext2D, 
  cameraEntity: CameraEntityShape) {  
  
  let cameraPos = cameraEntity.point.pos();

  ctx.fillStyle = "grey";
  ctx.fillRect(
    cameraPos.x, 
    cameraPos.y, 
    cameraEntity.attributes.width, 
    cameraEntity.attributes.height);
}

function drawGun(
  ctx: CanvasRenderingContext2D, 
  gunEntity: GunEntityShape) {
  
  let gunStartPos = gunEntity.point.pos();
  let direction = gunEntity.point.direction;
  let gunLength = gunEntity.attributes.length;

  let gunEndPos = gunStartPos
    .moveAlong(direction, gunLength);

  ctx.strokeStyle = "red";
  ctx.lineWidth = 5;

  ctx.beginPath();
  ctx.moveTo(gunStartPos.x, gunStartPos.y);
  ctx.lineTo(gunEndPos.x, gunEndPos.y);
  ctx.closePath();
  ctx.stroke();
}

function drawDude(
  ctx: CanvasRenderingContext2D, 
  dudeEntity: DudeEntityShape) {
  
  let dudePos = dudeEntity.point.pos();
  let radius = dudeEntity.attributes.radius;
  
  ctx.strokeStyle = "black";
  ctx.lineWidth = 5;

  ctx.beginPath();
  ctx.arc(dudePos.x, dudePos.y, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.stroke();
}

function drawPlatform(
  ctx: CanvasRenderingContext2D, 
  platform: Platform) {
  
  ctx.fillStyle = "black";
  ctx.fillRect(
    platform.pos.x, 
    platform.pos.y, 
    platform.length, 
    10);
}

function drawBall(
  ctx: CanvasRenderingContext2D, 
  ball: BallEntityShape) {
  
  let pos = ball.point.pos();
  let radius = ball.attributes.radius;
  
  ctx.strokeStyle = "red";
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.stroke();
}
