// ------------------------------ DRAW ------------------------------
var DEFAULT_COLOR = "#000000";
var SELECTED_COLOR = "#ff0000";
var BACKGROUND_COLOR = "#EEEEEE";
var HIGHLIGHT_COLOR = "#2222AA";
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
    context.beginPath();
    context.fillStyle = fillColor;
    context.fillRect(position.x, position.y, width, height);
}

// ------------------- Others -------------------
function returnBiggestComponent(listOfBones) {
    var actual = new HashSet();
    var tmpRes = new HashSet();
    actual.fill(listOfBones);
    var keyArray = actual.keyArray();
    var res = [];
    //BFS
    while (!actual.isEmpty()) {
        var queue = [];
        tmpRes.clear();
        queue.push(keyArray[0]);
        actual.remove(keyArray[0]);
        while (queue[0]) {
            //look at all child and ask if they are in set
            for (var i = 0; i < queue[0].children.length; i++) {
                if (actual.contains(queue[0].children[i]) && !tmpRes.contains(queue[0].children[i])) {
                    queue.push(queue[0].children[i]);
                    actual.remove(queue[0].children[i]);
                }
            }
            //also look at parent and ask if it is in set
            if (queue[0].parent && actual.contains(queue[0].parent)) {
                queue.push(queue[0].parent);
                actual.remove(queue[0].parent);
            }
            //remove first element from queue;
            tmpRes.add(queue.shift());
        }
        //actualize key array
        keyArray = actual.keyArray();
        var tmpResArray = tmpRes.keyArray();
        if (res.length < tmpResArray.length) {
            res = tmpResArray.slice();
        }
    }
    return res;
}

