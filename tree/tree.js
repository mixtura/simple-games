function TreeModel(trunk) {
  this.trunk = trunk;
}

function BranchModel(parent, relativeWeight, length, width, angle, absoluteWeight) {
  this.parent = parent;
  this.length = length;
  this.width = width;
  this.angle = angle;
  this.absoluteWeight = absoluteWeight;
  this.relativeWeight = relativeWeight;
}

function generateTreeModel({
  minAngle,
  maxAngle,
  angleVariant,
  baseLengthes,
  lengthVariantRatio,
  baseWeights,
  weightVariant,
  minWidth,
  trunkWidth,
  trunkLength}) {
       
  let trunk = new BranchModel(null, 1, trunkLength, trunkWidth, Math.PI / 2, 1);

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
      let length = getRandWithVariantRatio(baseLengthes[currentLevel], lengthVariantRatio);
      let absoluteWeight = parent.absoluteWeight * weight;
      let width = getWidth(parent.width, weight);
      let angle = angles[index];
      let branch = new BranchModel(parent, weight, length, width, angle, absoluteWeight);

      branch.children = createChildBranches(branch, currentLevel + 1);
      
      return branch;
    });

    return childBranches;
  }

  function getAngles(count) {
    return [...Array(count).keys()].map(index => getAngle(index, count));
  }

  function getAngle(branchOrderNum, branchesCount) {
    let range = (maxAngle - minAngle) / branchesCount;

    let baseMinAngle = (minAngle + branchOrderNum * range) * Math.PI;
    let baseMaxAngle = (minAngle + (branchOrderNum + 1) * range) * Math.PI;
    let baseAngle = baseMinAngle + (baseMaxAngle - baseMinAngle) / 2;

    return getRandBetween(baseAngle - angleVariant, baseAngle + angleVariant);
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

function drawTree(ctx, treeModel, showLeaves, elasticityRatio, sun) {
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'black';  

  drawBranch(treeModel.trunk, 0, new Vector(ctx.canvas.width / 2, 0));

  function drawBranch(branch, baseAngle, jointPos) {
    let dir = new Vector(Math.cos(baseAngle + branch.angle), Math.sin(baseAngle + branch.angle));

    dir = new Vector(dir.x, dir.y - Math.pow(1 / (elasticityRatio + 1), branch.absoluteWeight * 10));
    dir = new Vector(dir.x, dir.y + sun);

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
}