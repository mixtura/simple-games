function TreeModel(trunk) {
  this.trunk = trunk;
}

function BranchModel(
  parent, 
  weight, 
  length, width, 
  absoluteAngle, 
  absoluteWeight, 
  direction) {
  
  this.parent = parent;
  this.weight = weight;
  this.length = length;
  this.width = width;
  this.absoluteAngle = absoluteAngle;
  this.absoluteWeight = absoluteWeight;  
  this.direction = direction;
}

function generateTreeModel({
  sun,
  elasticityRatio,
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

  let trunk = new BranchModel(null, 1, trunkLength, trunkWidth, Math.PI / 2, 1, Vector.up);

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
    angles.sort(getClosestToPerpendicularAngle);

    return weights.map((weight, index) => {
      let absoluteWeight = getAbsoluteWeight(parent, weight);
      let absoluteAngle = getAbsoluteAngle(parent, angles[index]); 
      let baseLength = baseLengthes[currentLevel];
      let angle = angles[index];

      let branch = new BranchModel(
        parent,
        weight,
        getRandWithVariantRatio(baseLength, lengthVariantRatio),
        getWidth(parent, weight),
        getAbsoluteAngle(parent, angle),
        absoluteWeight,
        getDirection(absoluteAngle, absoluteWeight)
      );

      branch.children = createChildBranches(branch, currentLevel + 1);
      
      return branch;
    });
  }

  function getClosestToPerpendicularAngle(a, b) {
    a = a < Math.PI / 2 ? a : Math.PI - a;
    b = b < Math.PI / 2 ? b : Math.PI - b;

    return a - b;
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

  function getAbsoluteAngle(parent, angle) {
    return parent.absoluteAngle + angle - Math.PI / 2;
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

  function getAbsoluteWeight(parent, weight) {
    return parent.absoluteWeight * weight;
  }

  function getWidth(parent, childRelativeWeight) {
    return parent.width * childRelativeWeight;
  }

  function getDirection(absoluteAngle, absoluteWeight) {
    let dir = Vector.fromAngle(absoluteAngle);
    let gravityImpact = Math.pow(1 / (elasticityRatio + 1), absoluteWeight * 10);

    dir = Vector.down.multiply(gravityImpact).add(dir);
    dir = Vector.up.multiply(sun).add(dir)

    return dir;
  }
}

function drawTree(ctx, treeModel, showLeaves) {
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'black';  

  drawBranch(treeModel.trunk, new Vector(ctx.canvas.width / 2, 0));

  function drawBranch(branch, jointPos) {
    let endPos = branch.direction.multiply(branch.length).add(jointPos);
    let childrenJointPos = branch.direction.multiply(-branch.width / 2).add(endPos);

    ctx.strokeStyle = "black";
    ctx.lineWidth = branch.width;

    ctx.beginPath();
    ctx.moveTo(jointPos.x, jointPos.y);
    ctx.lineTo(endPos.x, endPos.y);
    ctx.stroke();

    if(branch.children) {    
      for(let childBranch of branch.children) {
        drawBranch(childBranch, childrenJointPos);
      }
    } else if(showLeaves) {
      ctx.fillStyle = "green";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(endPos.x, endPos.y, 8, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}