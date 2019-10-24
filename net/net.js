function Vector(x, y) {
	this.x = x;
	this.y = y;
}

function Dot(x, y, movementAngle, size, color) {
	this.x = x;
	this.y = y;
	this.movementAngle = movementAngle;
	this.size = size;
	this.color = color;
	this.currentColor = color;
}

function Line(dot1, dot2, length) {
	this.dot1 = dot1;
	this.dot2 = dot2;
	this.length = length;
}

function moveDot(dot, maxX, maxY, maxDistance, speedFactor) {
	dot.x += Math.cos(dot.movementAngle) * speedFactor;
	dot.y += Math.sin(dot.movementAngle) * speedFactor;	
	
	if(dot.x > maxX + maxDistance) {
		dot.x = -maxDistance;
	} else if(dot.x < -maxDistance) {
		dot.x = maxX + maxDistance;
	}
	
	if(dot.y > maxY + maxDistance) {
		dot.y = -maxDistance;
	} else if(dot.y < -maxDistance) {
		dot.y = maxY + maxDistance;
	}
}

function getDistance(dot1, dot2) {
	return Math.sqrt(Math.pow(dot2.x - dot1.x, 2) + Math.pow(dot2.y - dot1.y, 2));
}

function getLines(dots, maxDistance) {
	var lines = [];
	
	for(var dotIndex = 0; dotIndex < dots.length; dotIndex++) {
		var dot = dots[dotIndex];
		
		for(var dotToCheckIndex = dotIndex + 1; dotToCheckIndex < dots.length; dotToCheckIndex++) {
			if(dotIndex == dotToCheckIndex) {
				continue;
			}
						
			var dotToCheck = dots[dotToCheckIndex];			
			var distance = getDistance(dot, dotToCheck);
			
			if(distance > maxDistance) {
				continue;
			}
			
			lines.push(new Line(dot, dotToCheck, distance));
		}
	}
	
	return lines;
}

function drawDots(ctx, dots) {
	for(var dot of dots) {
		ctx.fillStyle = `rgb(${dot.currentColor[0]},${dot.currentColor[1]},${dot.currentColor[2]})`;
		
		ctx.beginPath();
		ctx.arc(dot.x, dot.y, dot.size, 2 * Math.PI, false);		
		ctx.fill();
	}
}

function drawLines(ctx, lines, maxLength) {	
	lines.sort((a, b) => b.length - a.length);
	
	for(var line of lines) {
		var maxWidth = Math.min(line.dot1.size, line.dot2.size);
		var lineWidth = maxWidth - (line.length / maxLength) * maxWidth;

		var gradient = ctx.createLinearGradient(line.dot1.x, line.dot1.y, line.dot2.x, line.dot2.y);

		gradient.addColorStop("0", `rgb(${line.dot1.color[0]},${line.dot1.color[1]},${line.dot1.color[2]})`);
		gradient.addColorStop("1.0", `rgb(${line.dot2.color[0]},${line.dot2.color[1]},${line.dot2.color[2]})`);
		
		ctx.lineWidth = lineWidth;
		ctx.strokeStyle = gradient;
		
		ctx.beginPath();
		ctx.moveTo(line.dot1.x, line.dot1.y);
		ctx.lineTo(line.dot2.x, line.dot2.y);
		ctx.stroke();
	}
}

var dotsCount = 300;
var speedFactor = 0.8;
var dots = [];
var width = window.innerWidth;
var height = window.innerHeight;
var maxDistance = 130; 
var minDotSize = 1.5;
var maxDotSize = 3;
var backgroundColor = "black";
var color = [
	{min: 0, max: 255},
	{min: 0, max: 255},
	{min: 0, max: 255}
]

while(--dotsCount != 0) {
	var maxWidth = width + maxDistance;
	var maxHeight = height + maxDistance;
	
	var randMovementAngle = Math.random() * Math.PI * 2;
	var randSize = Math.random() * (maxDotSize - minDotSize) + minDotSize;
	var randX = Math.random() * maxWidth;
	var randY = Math.random() * maxHeight;
	var randColor = [
		getRandColorChannel(color[0].min, color[0].max),
		getRandColorChannel(color[1].min, color[1].max),
		getRandColorChannel(color[2].min, color[2].max)];
	
	var dot = new Dot(
		randX, 
		randY, 
		randMovementAngle, 
		randSize,
		randColor);
	
	dots.push(dot);
}

var ctx = document.getElementById("canvas").getContext('2d');

ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;

function getRandColorChannel(min, max) {
	return min + Math.floor(Math.random() * max);
}

setInterval(function() {	
	ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	
	for(var dot of dots) {
		moveDot(dot, width, height, maxDistance, speedFactor);
	}
		
	var lines = getLines(dots, maxDistance);
	
	drawLines(ctx, lines, maxDistance);	
	drawDots(ctx, dots)	
}, 15);

window.addEventListener("resize", function() {
	ctx.canvas.width = window.innerWidth;
	ctx.canvas.height = window.innerHeight;
});