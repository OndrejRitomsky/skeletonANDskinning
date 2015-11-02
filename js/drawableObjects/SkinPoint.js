function SkinPoint(x, y) {
    this.coordinates = [x, y, 1];
    this.cachedCoordinates = [x, y, 1];
    this.weights = [];
    this.bones = [];
}

SkinPoint.prototype.transform = function () {
    var sum = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    for (var i = 0; i < this.bones.length; i++) {
        sum = numeric.add(sum, this.mulMatrixByScalar(this.bones[i].transformations, this.weights[i]));
    }
    if (sum[0][0] != 0) {
        this.coordinates = numeric.dot(sum, this.cachedCoordinates);
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

SkinPoint.prototype.cacheCoordinates = function () {
    this.cachedCoordinates = this.coordinates.slice();
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
            if (child == nearestBone)
                continue;

            dist = isCloseEnough(child, limit);
            if (dist > 0) {
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
    var weights = distances.map(function(x){return x / sm;});
    for (var i = 0; i < bones.length; i++) {
        this.bones.push(bones[i]);
        this.weights.push(weights[i]);
    }
    //console.log(weights);

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
