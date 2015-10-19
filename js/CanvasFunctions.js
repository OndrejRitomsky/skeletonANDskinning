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
    context.moveTo(position1[0], position1[1]);
    context.lineTo(position2[0], position2[1]);
    context.stroke();
}

function drawDiskPart(context, position, radius, fillColor, fromDegree, toDegree) {
    context.beginPath();
    context.fillStyle = fillColor;
    context.arc(position[0], position[1], radius, fromDegree, toDegree);
    context.fill();
}

function drawRect(context, position, width, height, fillColor) {
    context.beginPath();
    context.fillStyle = fillColor;
    context.fillRect(position[0], position[1], width, height);
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
        while (queue.length > 0) {
            var bone = queue[0];
            //look at all child and ask if they are in set
            for (var i = 0; i < bone.children.length; i++) {
                var childBone = bone.children[i];
                if (actual.contains(childBone) && !tmpRes.contains(childBone)) {
                    queue.push(childBone);
                    actual.remove(childBone);
                }
            }
            //also look at parent and ask if it is in set
            var parentBone = bone.parent;
            if (parentBone && actual.contains(parentBone)) {
                queue.push(parentBone);
                actual.remove(parentBone);
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

