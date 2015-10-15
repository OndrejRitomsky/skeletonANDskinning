// ------------------------------ DRAW ------------------------------
var DEFAULT_COLOR = "#000000";
var SELECTED_COLOR = "#ff0000";
var BACKGROUND_COLOR = "#ffffff";
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
    context.fillStyle = fillColor;
    context.fillRect(position.x, position.y, width, height);
}
// ------------------------------ OTHERS  ------------------------------
/**
 * checks if bone is connected to bone2, while using only bones
 * @param {Bone} bone - start bone
 * @param {Bone} bone2 - end bone
 * @param {Bone[]} bones - bones which can be used in connected "path"
 * @param {boolean[]} usedBones - booleans for bones if they were already used
 * @returns {boolean} bone is connected with bone2 trough bones.
 */
function isBoneConnectedToBone2TroughBones(bone, bone2, bones, usedBones) {
    if (bone == bone2) {
        return true;
    }
    for (var i = 0; i < bones.length; i++) {
        if (usedBones[i]) {
            continue;
        }

        // check connection trough parent
        if (bone.parent && bone.parent == bones[i]) {
            usedBones[i] = true;
            if (isBoneConnectedToBone2TroughBones(bones[i], bone2, bones, usedBones)) {
                return true;
            }
            usedBones[i] = false;
        }

        // check connection trough parent.children since connection can be trough start point
        if (bone.parent){
            for (var j = 0; j < bone.parent.children.length; j++) {
                var child = bone.parent.children[j];
                if (child == bones[i]) {
                    usedBones[i] = true;
                    if (isBoneConnectedToBone2TroughBones(bones[i], bone2, bones, usedBones)) {
                        return true;
                    }
                    usedBones[i] = false;
                }
            }
        }

        // check connection trough children
        for (var j = 0; j < bone.children.length; j++) {
            var child = bone.children[j];
            if (child == bones[i]) {
                usedBones[i] = true;
                if (isBoneConnectedToBone2TroughBones(bones[i], bone2, bones, usedBones)) {
                    return true;
                }
                usedBones[i] = false;
            }
        }
    }
    return false;
}
