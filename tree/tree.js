function Vector(x, y) {
    this.x = x;
    this.y = y;
}

function TreeModel(trunk) {
    this.trunk = trunk;
}

function BranchModel(parent, length, startWidth, endWidth, direction, absoluteWeight) {
    this.parent = parent;
    this.length = length;
    this.startWidth = startWidth;
    this.endWidth = endWidth;
    this.direction = direction;
    this.absoluteWeight = absoluteWeight;
}

function generateTreeModel(
    childrenCountParams,
    lengthParams,
    weightBalanceParams,
    levelsMaxCount,
    lengthReductionFactor,
    widthReductionFactor) {
     
    var trunk = new BranchModel(null, 100, 100, 80, 100);

    trunk.children = createChildBranches(trunk, 0);

    return new TreeModel(trunk);

    function createChildBranches(parent, currentLevel) {
        if(currentLevel == levelsMaxCount) {
            return;
        }
        
        var count = getRandBetween(childrenCountParams.min, childrenCountParams.max);
        var currentBranchNumber = 0;
        var weightLeft = 1;
        var children = [];

        while(currentBranchNumber-- != count && weightLeft > 0) {
            var weight = getRandWeight();
            var absoluteWeight = parent.absoluteWeight * weight;
            var startWidth = getStartBranchWidth(parent.endWidth, weight);
            var endWidth = getEndBranchWidth(startWidth, widthReductionFactor);
            var direction = getRandDirection(currentBranchNumber, count);

            weightLeft -= weight;

            var branch = new BranchModel(parent, 50, startWidth, endWidth, direction, absoluteWeight);

            branch.children = createChildBranches(branch, currentLevel + 1);
        }

        return children;
    }

    function getRandDirection(branchNumber, neighboursCount) {
        var angle = branchNumber / neighboursCount * Math.PI;
        
        return new Vector(Math.cos(angle), Math.sin(angle));
    }
    
    function getRandWeight(weightLeft) {
        var randWeight = getRandBetween(weightBalanceParams.min, weightBalanceParams.max);

        if(randWeight <= 0) {
            randWeight = weightLeft;
        }

        return randWeight;
    }

    function getStartBranchWidth(parentWidth, childRelativeWeight) {
        return parentWidth * childRelativeWeight;
    }

    function getEndBranchWidth(startBranchWidth, reduceFactor) {
        return startBranchWidth * reduceFactor;
    }

    function getBranchWidthAtThePoint(startBranchWidth, pointPosition, reduceFactor) {
        return getEndBranchWidth(startBranchWidth, reduceFactor) * (1 - pointPosition);
    }
}

function getRandBetween(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

var treeModel = generateTreeModel(
    {min: 2, max: 5},
    {min: 5, max: 7},
    {min: 3, max: 4},
    5,
    0.7,
    0.8);

function drawTree(ctx, tree) {
    ctx.strokeStyle = "black";

    drawBranch(tree.trunk);

    function drawBranch(branch) {
        ctx.lineWidth = branch.startWidth;
        ctx.beginPath();
        ctx.moveTo();
        ctx.lineTo();
        ctx.stroke();

        for(var childBranch of branch.children) {
            drawBranch(childBranch);
        }
    }
}