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
  baseMinAngle,
  baseMaxAngle,
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
    let childBranches = [];
    let branchesCount = weights.length;

    for(let currentBranchNumber in weights) {
      currentBranchNumber = Number.parseInt(currentBranchNumber);

      let angle = getAngle(currentBranchNumber, branchesCount);
      let length = getRandWithVariant(baseLengthes[currentLevel], lengthVariant);
      let branch = generateBranch(parent, weights[currentBranchNumber], length, angle);

      branch.children = createChildBranches(branch, currentLevel + 1);

      childBranches.push(branch);
    }

    return childBranches;
  }

  function generateBranch(parent, relativeWeight, length, angle) {
    let absoluteWeight = parent.absoluteWeight * relativeWeight;
    let width = getwidth(parent.width, relativeWeight);
    
    return new BranchModel(parent, length, width, angle, absoluteWeight);
  }

  function getAngle(branchOrderNum, branchesCount) {
    let range = (baseMaxAngle - baseMinAngle) / branchesCount;

    let minAngle = (baseMinAngle + branchOrderNum * range) * Math.PI;
    let maxAngle = (baseMinAngle + (branchOrderNum + 1) * range) * Math.PI;

    return getRandBetween(minAngle, maxAngle);
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

    branchWeights.sort(() => Math.random() - 0.5);

    return branchWeights;
  }

  function getwidth(parentWidth, childRelativeWeight) {
    return parentWidth * childRelativeWeight;
  }
}

function drawTree(ctx, treeModel, showLeaves) {
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'black';  

  drawBranch(treeModel.trunk, new Vector(ctx.canvas.width / 2, 0));

  function drawBranch(branch, jointPos) {
    let baseAngle = branch.parent ? (branch.parent.angle - Math.PI / 2) : 0;
    let dir = new Vector(Math.cos(baseAngle + branch.angle), Math.sin(baseAngle + branch.angle));

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
        drawBranch(childBranch, new Vector(childrenJointPosX, childrenJointPosY));
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