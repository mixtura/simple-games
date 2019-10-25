function Vector(x, y) {
    this.x = x;
    this.y = y;
}

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


function LeafModel(branch) {
    
}


function generateTreeModel(
    lengthParams,
    angleParams,
    baseWeights,
    weightVariant,
    levelsMaxCount,
    trunkWidth,
    trunkLength) {
     
    let trunk = new BranchModel(null, trunkLength, trunkWidth, Math.PI / 2, 100);

    trunk.children = createChildBranches(trunk, 0);

    return new TreeModel(trunk);

    function createChildBranches(parent, currentLevel) {
        if(currentLevel == levelsMaxCount) {
            return;
        }
        
        let weights = getWeights();
        let childBranches = [];
        let branchesCount = weights.length;

        for(let currentBranchNumber = 0; currentBranchNumber < weights.length; currentBranchNumber++) {
            let angle = getAngle(currentBranchNumber, branchesCount);
            let branch = generateBranch(parent, weights[currentBranchNumber], angle);

            branch.children = createChildBranches(branch, currentLevel + 1);

            childBranches.push(branch);
        }

        return childBranches;
    }

    function generateBranch(parent, relativeWeight, angle) {
        let absoluteWeight = parent.absoluteWeight * relativeWeight;
        let width = getwidth(parent.width, relativeWeight);
        let length = getRandBetween(lengthParams.min, lengthParams.max);
        
        return new BranchModel(parent, length, width, angle, absoluteWeight);
    }

    function getAngle(branchOrderNum, branchesCount) {
        let range = (angleParams.max - angleParams.min) / branchesCount;

        let minAngle = (angleParams.min + branchOrderNum * range) * Math.PI;
        let maxAngle = (angleParams.min + (branchOrderNum + 1) * range) * Math.PI;

        return getRandBetween(minAngle, maxAngle);
    }
    
    function getWeights() {
        let weightLeft = 1;
        let branchWeights = [];

        for(var baseWeight of baseWeights) {
            if(weightLeft < 0) {
                break;
            }

            let weight = getRandBetween(baseWeight - weightVariant, baseWeight + weightVariant);

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

function getRandBetween(min, max) {
    return Math.random() * (max - min) + min;
}

function drawTree(ctx, tree) {
    ctx.lineWidth = 1;    

    drawBranch(tree.trunk, new Vector(ctx.canvas.width / 2, 0));

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
        } else {
            ctx.fillStyle = "green";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(endPosX, endPosY, 8, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

let canvasContext = document.getElementById("canvas").getContext('2d');

canvasContext.canvas.width = window.innerWidth;
canvasContext.canvas.height = window.innerHeight;

let treeModel = generateTreeModel(
    {min: 120, max: 150},
    {min: 0.2, max: 0.8},    
    [0.6, 0.3, 0.6],
    0.05,
    6,
    50,
    180);

canvasContext.translate(0, canvasContext.canvas.height);
canvasContext.scale(1, -1);

drawTree(canvasContext, treeModel);

let toolbox = createToolbox({
    baseLength: {
        type: inputType.value
    },
    lengthVariant: {
        type: inputType.value
    },
    weights: {
        type: inputType.array,
        arrElement: {
            type: inputType.value
        }
    },
    weightVariant: {
        type: inputType.value
    }
});

document.getElementsByTagName("body")[0].prepend(toolbox);