function TreeModel(trunk) {
  this.trunk = trunk;
}

function BranchModel(parent, length, width, angle, absoluteWeight) {
  this.parent = parent;
  this.length = length;
  this.width = width;
  this.angle = angle;
  this.absoluteWeight = absoluteWeight;
}

function generateTreeModel({
  gravity,
  minAngle,
  maxAngle,
  angleVariant,
  baseLengthes,
  lengthVariant,
  baseWeights,
  weightVariant,
  minWidth,
  trunkWidth,
  trunkLength}) {
       
  let trunk = new BranchModel(null, trunkLength, trunkWidth, Math.PI / 2, 100);

  trunk.children = createChildBranches(trunk, 0);

  return new TreeModel(trunk);

  function createChildBranches(parent, currentLevel) {
    if(currentLevel == baseLengthes.length) {
      return;
    }
    
    if(parent.width < minWidth) {
      return;
    }

    let weights = getWeights();
    let angles = getAngles(weights.length);

    weights.sort();
    angles.sort((a, b) => {
      // sort by closest to perpendicular
      a = a < Math.PI / 2 ? a : Math.PI - a;
      b = b < Math.PI / 2 ? b : Math.PI - b;

      return a - b;
    });

    let childBranches = weights.map((weight, index) => {
      let length = getRandWithVariant(baseLengthes[currentLevel], lengthVariant);
      let absoluteWeight = parent.absoluteWeight * weight;
      let width = getWidth(parent.width, weight);
      let angle = angles[index];
      let branch = new BranchModel(parent, length, width, angle, absoluteWeight);

      branch.children = createChildBranches(branch, currentLevel + 1);
      
      return branch;
    });

    return childBranches;
  }

  function applyGravity() {
    
  }

  function getAngles(count) {
    return [...Array(count).keys()].map(index => getAngle(index, count));
  }

  function getAngle(branchOrderNum, branchesCount) {
    let range = (maxAngle - minAngle) / branchesCount;

    let baseMinAngle = (minAngle + branchOrderNum * range) * Math.PI;
    let baseMaxAngle = (minAngle + (branchOrderNum + 1) * range) * Math.PI;
    let baseAngle = baseMinAngle + (baseMaxAngle - baseMinAngle) / 2;

    return getRandWithVariant(baseAngle, angleVariant);
  }
  
  function getWeights() {
    let weightLeft = 1;
    let branchWeights = [];

    for(var baseWeight of baseWeights) {
      if(weightLeft < 0) {
        break;
      }

      let weight = getRandWithVariant(baseWeight, weightVariant);

      weightLeft -= weight;

      branchWeights.push(weight);
    }

    return branchWeights;
  }

  function getWidth(parentWidth, childRelativeWeight) {
    return parentWidth * childRelativeWeight;
  }
}

function drawTree(ctx, treeModel, showLeaves) {
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'black';  

  drawBranch(treeModel.trunk, 0, new Vector(ctx.canvas.width / 2, 0));

  function drawBranch(branch, baseAngle, jointPos) {
    let dir = new Vector(Math.cos(baseAngle + branch.angle), Math.sin(baseAngle + branch.angle));

    dir = new Vector(dir.x, (dir.y + 1));

    let endPosX = jointPos.x + dir.x * branch.length;
    let endPosY = jointPos.y + dir.y * branch.length; 
    
    let childrenJointPosX = jointPos.x + dir.x * (branch.length - branch.width / 2);
    let childrenJointPosY = jointPos.y + dir.y * (branch.length - branch.width / 2);

    ctx.strokeStyle = "black";
    ctx.lineWidth = branch.width;

    ctx.beginPath();
    ctx.moveTo(jointPos.x, jointPos.y);
    ctx.lineTo(endPosX, endPosY);
    ctx.stroke();

    if(branch.children) {    
      for(let childBranch of branch.children) {
        drawBranch(childBranch, baseAngle + branch.angle - Math.PI / 2, new Vector(childrenJointPosX, childrenJointPosY));
      }
    } else if(showLeaves) {
      ctx.fillStyle = "green";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(endPosX, endPosY, 8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function debugRay(startPos, angle, color) {
    let endPosX = startPos.x + Math.cos(angle) * 20;
    let endPosY = startPos.y + Math.sin(angle) * 20;

    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(startPos.x, startPos.y);
    ctx.lineTo(endPosX, endPosY);
    ctx.stroke();
  }
}