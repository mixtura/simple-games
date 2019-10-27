let canvasContext = document.getElementById("canvas").getContext('2d');

canvasContext.canvas.width = window.innerWidth;
canvasContext.canvas.height = window.innerHeight;
canvasContext.translate(0, canvasContext.canvas.height);
canvasContext.scale(1, -1);

let initialValues = {
  minAngle: 0.2,
  maxAngle: 0.8,
  angleVariant: 0.2,
  baseLengthes: [130, 100, 40, 40, 40, 30, 30, 20, 20],
  lengthVariant: 5,
  baseWeights: [0.6, 0.4, 0.3],
  weightVariant: 0.05,
  minWidth: 0.3,
  trunkWidth: 50,
  trunkLength: 130,
  showLeaves: true
};

let schema = {
  minAngle: inputType.value,
  maxAngle: inputType.value,
  angleVariant: inputType.value,
  baseLengthes: inputType.array,
  lengthVariant: inputType.value,
  baseWeights: inputType.array,
  weightVariant: inputType.value,
  minWidth: inputType.value,
  trunkWidth: inputType.value,
  trunkLength: inputType.value,
  showLeaves: inputType.checkbox
};

let toolbox = createToolbox(
  schema,
  initialValues,
  (params) => {
    canvasContext.fillStyle = 'white';
    canvasContext.fillRect(0, 0, canvasContext.canvas.width, canvasContext.canvas.height);
    
    let treeModel = generateTreeModel(params);
  
    drawTree(canvasContext, treeModel, params.showLeaves);
  });

document.getElementsByTagName("body")[0].prepend(toolbox);