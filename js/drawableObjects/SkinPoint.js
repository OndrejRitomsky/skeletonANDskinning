function SkinPoint(x, y) {
    this.coordinates = [x, y, 1];
    this.cachedCoordinates = [x, y, 1];
    this.fakeCachedCoordinates = [x, y, 1];
    this.weights = [];
    this.bones = [];
    this.nearestBone = null;
    this.relatedAngle = 0;
}

SkinPoint.prototype.transform = function (bone, angle) {
    var sum = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    var isNearToJoint = this.isNearToJoint(bone);
    for (var i = 0; i < this.bones.length; i++) {
        if (isNearToJoint && bone == this.bones[i]) {
            sum = numeric.add(sum, this.mulMatrixByScalar(this.bones[i].calculateTransformation(this.relatedAngle + angle),
                this.weights[i]));
        } else {
            sum = numeric.add(sum, this.mulMatrixByScalar(this.bones[i].transformations, this.weights[i]));
        }
    }
    if (sum[0][0] != 0) {
        if (isNearToJoint) {
            this.coordinates = numeric.dot(sum, this.cachedCoordinates);
        } else {
            this.coordinates = numeric.dot(sum, this.fakeCachedCoordinates);
        }
    }
};

SkinPoint.prototype.transformCachedCoordinates = function () {
    var sum = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    for (var i = 0; i < this.bones.length; i++) {
        sum = numeric.add(sum, this.mulMatrixByScalar(this.bones[i].transformations, this.weights[i]));
    }
    if (sum[0][0] != 0) {
        this.cachedCoordinates = numeric.dot(sum, this.cachedCoordinates);
    }
};

SkinPoint.prototype.mulMatrixByScalar = function (matrix, scalar) {
    var result = [];
    for (var i = 0; i < matrix.length; i++) {
        result.push([]);
        for (var j = 0; j < matrix[i].length; j++) {
            result[i].push(matrix[i][j] * scalar);
        }
    }
    return result;
};

SkinPoint.prototype.cacheAngle = function(relatedAngle) {
    this.relatedAngle = relatedAngle;
};

SkinPoint.prototype.cacheCoordinates = function () {
    this.cachedCoordinates = this.coordinates.slice();
    this.fakeCachedCoordinates = this.coordinates.slice();
};

SkinPoint.prototype.cacheFakeCoordinates = function () {
    this.fakeCachedCoordinates = this.coordinates.slice();
};

SkinPoint.prototype.isNearToJoint = function (bone) {
    var isNearestBone = false;
    var containParent = false;
    var containChild = false;
    for(var i = 0; i < this.bones.length; i++){
        if(this.bones[i] == this.nearestBone.parent) {
            containParent = true;
        }
        if(this.bones[i] == bone && bone != this.nearestBone.parent){
            containChild = true;
        }
        if(this.bones[i] == bone && bone == this.nearestBone){
            isNearestBone = true;
        }
    }
    return (isNearestBone && containParent) || (!isNearestBone && containChild);
};

/**
 *
 * @param bones
 * @param {SkinPoint} predecessor
 */
SkinPoint.prototype.assignNearestBone = function (bones, predecessor) {
    var distanceToMid = Number.MAX_VALUE;
    var tmpPoint = new Point(this.coordinates);
    var nearestBone;
    var middlePoint;
    var tmpDist;
    var i;
    for (i = 0; i < bones.length; i++) {
        middlePoint = bones[i].startPoint.middlePoint(bones[i].endPoint);
        tmpDist = tmpPoint.getDistance(middlePoint);
        if (tmpDist < distanceToMid && !this.testIntersect(bones[i])) {
            if (predecessor) {
                if (predecessor.nearestBone.isNeighbour(bones[i])) {
                    distanceToMid = tmpDist;
                    nearestBone = bones[i];
                }
            } else {
                distanceToMid = tmpDist;
                nearestBone = bones[i];
            }
        }
    }

    var bones = [nearestBone];
    this.nearestBone = nearestBone;
    var parent = nearestBone.parent;
    var child;
    var distToStartPoint = tmpPoint.getDistance(nearestBone.startPoint);
    var distToEndPoint = tmpPoint.getDistance(nearestBone.endPoint);
    if (parent) {
        if (!this.testIntersect(parent) && distToEndPoint > distToStartPoint) {
            bones.push(parent);
        }

        for (i = 0; i < parent.children.length; i++) {
            child = parent.children[i];
            if (child == nearestBone) {
                continue;
            }

            if (distToEndPoint > distToStartPoint && !this.testIntersect(child)) {
                bones.push(child);
            }
        }
    }

    for (i = 0; i < nearestBone.children.length; i++) {
        child = nearestBone.children[i];
        if (child) {
            if ((!this.testIntersect(child) || nearestBone.children.length == 1) && distToEndPoint < distToStartPoint) {
                bones.push(child);
            }
        }
    }

    //2 children with same parent -> delete parent
    if (bones.length == 3) {
        if (bones[0].parent == bones[1].parent) {
            bones.splice(2, 1);
        } else if (bones[0].parent == bones[2].parent) {
            bones.splice(1, 1);
        } else if (bones[1].parent == bones[2].parent) {
            bones.splice(3, 1);
        }
    }

    this.bones = bones;
    this.recalculateWeights(bones, predecessor);
};

SkinPoint.prototype.recalculateWeights = function (bones, predecessor) {
    var distances = [];
    var i;
    var p1 = new Point(this.coordinates);
    var p2 = predecessor ? new Point(predecessor.coordinates) : null;
    var dense = false;
    if(predecessor) {
        dense = p1.getDistance(p2) < 15;
    }
    var exponent = dense ? 2 : 1;
    for (i = 0; i < bones.length; i++) {
        //maybe better distribution of weights
        //distances.push(Math.pow(this.isCloseEnough(bones[i], Number.MAX_VALUE), exponent));
        distances.push(this.isCloseEnough(bones[i], Number.MAX_VALUE));
    }

    var sm = 0;
    for (i = 0; i < distances.length; i++) {
        sm += distances[i];
    }

    if (distances.length > 1) {
        for (i = 0; i < distances.length; i++) {
            distances[i] = sm - distances[i];
        }

        sm = 0;
        for (i = 0; i < distances.length; i++) {
            sm += distances[i];
        }
    }

    var weights = distances.map(function (x) {
        return x / sm;
    });

    for (i = 0; i < weights.length; i++) {
        this.weights.push(weights[i]);
    }
};

SkinPoint.prototype.containBone = function(bone){
    for (var i = 0; i < this.bones.length; i++){
        if(bone === this.bones[i]){
            return true;
        }
    }
    return false;
};

SkinPoint.prototype.isCloseEnough = function (bone, limit) {
    var tmpPoint = new Point(this.coordinates);
    var middlePoint = bone.startPoint.middlePoint(bone.endPoint);
    var dist = tmpPoint.getDistance(middlePoint);
    return dist < limit ? dist : -1;
};

SkinPoint.prototype.intersects = function (p1, p2, p3, p4) {
    var det, gamma, lambda;
    det = (p2[0] - p1[0]) * (p4[1] - p3[1]) - (p4[0] - p3[0]) * (p2[1] - p1[1]);
    if (det === 0) {
        return false;
    } else {
        lambda = ((p4[1] - p3[1]) * (p4[0] - p1[0]) + (p3[0] - p4[0] ) * (p4[1] - p1[1])) / det;
        gamma = ((p1[1] - p2[1]) * (p4[0] - p1[0]) + (p2[0] - p1[0]) * (p4[1] - p1[1])) / det;
        return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
    }
};

SkinPoint.prototype.testIntersect = function (bone) {
    var midPoint = bone.startPoint.middlePoint(bone.endPoint);
    var bones2 = [];
    bones2.concat(bone.children);
    if(bone.parent) {
        bones2.push(bone.parent);
        bones2 = bones2.concat(bone.parent.children);
    }
    for (var j = 0; j < bones2.length; j++) {
        if(bones2[j] == bone) {
            continue;
        } else if (this.intersects(this.coordinates, midPoint.position, bones2[j].startPoint.position, bones2[j].endPoint.position)) {
            return true;
        }
    }
    return false;
};

