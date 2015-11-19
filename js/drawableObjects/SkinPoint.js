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
        if(isNearToJoint && bone == this.bones[i]) {
            sum = numeric.add(sum, this.mulMatrixByScalar(this.bones[i].calculateTransformation(this.relatedAngle + angle),
                this.weights[i]));
        } else {
            sum = numeric.add(sum, this.mulMatrixByScalar(this.bones[i].transformations, this.weights[i]));
        }
    }
    if (sum[0][0] != 0) {
        if(isNearToJoint) {
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
 * Find nearest bone to this point
 *
 * @param bones
 */
SkinPoint.prototype.assignNearestBone = function (bones) {
    var nearestBone;
    var distance = Number.MAX_VALUE;
    var tmpPoint = new Point(this.coordinates);
    for (var i = 0; i < bones.length; i++) {
        var middlePoint = bones[i].startPoint.middlePoint(bones[i].endPoint);
        var tmpDist = tmpPoint.getDistance(middlePoint);
        if (tmpDist < distance) {
            distance = tmpDist;
            nearestBone = bones[i];
        }
    }

    var self = this;
    function isCloseEnough(bone, limit) {
        var tmpPoint = new Point(self.coordinates);
        var middlePoint = bone.startPoint.middlePoint(bone.endPoint);
        var dist = tmpPoint.getDistance(middlePoint);
        return dist < limit ? dist : -1;
    }

    var distances = [distance];
    var bones = [nearestBone];
    this.nearestBone = nearestBone;
    var dist;
    var parent = nearestBone.parent;
    var child = nearestBone.children[0];
    var limit = nearestBone.length;
    if (parent) {
        dist = isCloseEnough(parent, limit);
        if (dist > 0) {
            distances.push(dist);
            bones.push(parent);
        }

        for (var i = 0; i < parent.children.length; i++){
            child = parent.children[i];
            dist = isCloseEnough(child, limit);
            if (child == nearestBone) {
                continue;
            }

            var tmpPoint = new Point(this.coordinates);
            var tmpDist1 = tmpPoint.getDistance(parent.children[i].startPoint);
            var tmpDist2 = tmpPoint.getDistance(parent.children[i].endPoint);
            if (dist > 0 && tmpDist1 < tmpDist2) {
                distances.push(dist);
                bones.push(child);
            }
        }
    }

    child = nearestBone.children[0];
    if (child) {
        dist = isCloseEnough(child, limit);
        if (dist > 0) {
            distances.push(dist);
            bones.push(child);
        }
    }

    var sm = 0;
    for (var i = 0; i < distances.length; i++) {
        sm += distances[i];
    }
    if(distances.length > 1) {
        for (var i = 0; i < distances.length; i++) {
            distances[i] = sm - distances[i];
        }
        sm = 0;
        for (var i = 0; i < distances.length; i++) {
            sm += distances[i];
        }
    }
    var weights = distances.map(function(x){return x / sm;});
    for (var i = 0; i < bones.length; i++) {
        this.bones.push(bones[i]);
        this.weights.push(weights[i]);
    }

    /*this.weights.push(0.8);

    if (nearestBone.parent) {
        this.bones.push(nearestBone.parent);
        this.weights.push(0.2);
    } else {
        this.weights[0] += 0.2;
    }*/

    /* premysliet
    if (nearestBone.children[0]) {
        this.bones.push(nearestBone.children[0]);
        this.weights.push(0.1);
    } else {
        this.weights[0] += 0.1;
    }*/

    //if nearestBone have more children which from them have influence on this skin point?
};
