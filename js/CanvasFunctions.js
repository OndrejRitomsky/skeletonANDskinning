var DEFAULT_COLOR = "#000000";
var SELECTED_COLOR = "#ff0000";
var BACKGROUND_COLOR = "#ffffff";
var HIGHLIGHT_COLOR = "#0000ff";
var FENCE_COLOR = "RGBA(0, 0, 64, 0.2)";

function drawLine(context, position1, position2, color, width) {
    context.beginPath();
    context.lineWidth = width;
    context.strokeStyle = color;
    context.moveTo(position1.x, position1.y);
    context.lineTo(position2.x, position2.y);
    context.stroke();
}

function drawDiskPart(context, position, radius, fillColor, fromDegree, toDegree) {
    context.beginPath();
    context.fillStyle = fillColor;
    context.arc(position.x, position.y, radius, fromDegree, toDegree);
    context.fill();
}

function drawRect(context, position, width, height, fillColor) {
    context.fillStyle = fillColor;
    context.fillRect(position.x, position.y, width, height);
}
