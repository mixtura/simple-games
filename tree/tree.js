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
    weightBalanceParams,
    angleParams,
    branchesMaxCount,
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

        while(weightLeft > 0 && branchWeights.length < branchesMaxCount) {
            let weight = getRandBetween(weightBalanceParams.min, weightBalanceParams.max); 

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

    function drawBranch(branch, parentEndPos) {
        let parentAngle = branch.parent ? (branch.parent.angle - Math.PI / 2) : 0;
        
        let startPosX = parentEndPos.x;
        let startPosY = parentEndPos.y;

        let endPosX = startPosX + Math.cos(parentAngle + branch.angle) * branch.length;
        let endPosY = startPosY + Math.sin(parentAngle + branch.angle) * branch.length; 

        
        ctx.strokeStyle = "black";
        ctx.lineWidth = branch.width;
        ctx.beginPath();
        ctx.moveTo(startPosX, startPosY);
        ctx.lineTo(endPosX, endPosY);
        ctx.stroke();

        if(branch.children) {        
            for(let childBranch of branch.children) {
                drawBranch(childBranch, new Vector(endPosX, endPosY));
            }
        } else {
            ctx.strokeStyle = "green";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(endPosX, endPosY, 8, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}

let canvasContext = document.getElementById("canvas").getContext('2d');

canvasContext.canvas.width = window.innerWidth;
canvasContext.canvas.height = window.innerHeight;

let treeModel = generateTreeModel(
    {min: 80, max: 110},
    {min: 0.4, max: 0.7},
    {min: 0.2, max: 0.8},
    3,
    7,
    50,
    180);

canvasContext.translate(0, canvasContext.canvas.height);
canvasContext.scale(1, -1);

drawTree(canvasContext, treeModel);
