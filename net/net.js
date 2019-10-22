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

function moveDot(dot, maxX, maxY, maxDistance) {
	var speed = 0.5;
	
	dot.x += Math.cos(dot.movementAngle) * speed;
	dot.y += Math.sin(dot.movementAngle) * speed;	
	
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
		var minWidth = Math.min(line.dot1.size, line.dot2.size);
		var lineWidth = minWidth - (line.length / maxLength) * minWidth;
		var color = mixColors(line.dot1.currentColor, line.dot2.currentColor, 0.5);
		
		ctx.lineWidth = lineWidth;
		ctx.strokeStyle = `rgb(${color[0]},${color[1]},${color[2]})`;;
		
		ctx.beginPath();
		ctx.moveTo(line.dot1.x, line.dot1.y);
		ctx.lineTo(line.dot2.x, line.dot2.y);
		ctx.stroke();
	}
}

var dotsCount = 150;
var dots = [];
var width = window.innerWidth;
var height = window.innerHeight;
var maxDistance = 200; 
var minDotSize = 1.5;
var maxDotSize = 2.5;
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

function mixColors(rgbA, rgbB, amountToMix){
	var r = mixColorChannels(rgbA[0],rgbB[0],amountToMix);
	var g = mixColorChannels(rgbA[1],rgbB[1],amountToMix);
	var b = mixColorChannels(rgbA[2],rgbB[2],amountToMix);
	
	return [r,g,b];
	
	function mixColorChannels(colorChannelA, colorChannelB, amountToMix){
		var channelA = colorChannelA*amountToMix;
		var channelB = colorChannelB*(1-amountToMix);
		return parseInt(channelA+channelB);
	}
}

/*
setInterval(function() {
	for(var dot of dots) {
		dot.movementAngle = Math.random() * Math.PI * 2;
	}
}, 100)

setInterval(function() {
	for(var dot of dots) {
		dot.currentColor = mixColors(dot.currentColor, [255, 255, 255], 0.9);
	}
}, 50);

document.getElementById("text").addEventListener("keypress", function(e) {	
	for(var dot of dots) {
		dot.currentColor = mixColors(dot.currentColor, dot.color, 0.7);
	}
});
*/

setInterval(function() {	
	ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
	
	for(var dot of dots) {
		moveDot(dot, width, height, maxDistance);
	}
		
	var lines = getLines(dots, maxDistance);
	
	drawLines(ctx, lines, maxDistance);	
	drawDots(ctx, dots)	
}, 10);