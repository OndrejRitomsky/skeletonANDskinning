function SkinPoint(x, y) {
    this.coordinates = [x, y, 1];
    this.weights = [];
    this.bones = [];
}

SkinPoint.prototype.transform = function () {
    var sum = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    for (var i = 0; i < this.bones.length; i++) {
        sum = numeric.add(sum, this.mulMatrixByScalar(this.bones[i].transformations, this.weights[i]));
    }
    if (sum[0][0] != 0) {
        this.coordinates = numeric.dot(sum, this.coordinates);
    }
};

SkinPoint.prototype.mulMatrixByScalar = function(matrix, scalar){
    result = [];
    for(var i = 0; i < matrix.length; i++){
        result.push([]);
        for(var j = 0; j < matrix[i].length; j++){
            result[i].push(matrix[i][j] * scalar);
        }
    }
    return result;
};

/**
 * Find nearest bone to this point
 *
 * @param bones
 */
SkinPoint.prototype.assignNearestBone = function (bones) {
    var nearestBone;
    var distance = 100000000000;
    var tmpPoint = new Point(this.coordinates);
    for (var i = 0; i < bones.length; i++) {
        var middlePoint = bones[i].startPoint.middlePoint(bones[i].endPoint);
        var tmpDist = tmpPoint.getDistance(middlePoint);
        if (tmpDist < distance) {
            distance = tmpDist;
            nearestBone = bones[i];
        }
    }
    this.bones.push(nearestBone);
    this.weights.push(0.8);

    if (nearestBone.parent) {
        this.bones.push(nearestBone.parent);
        this.weights.push(0.2);
    } else {
        this.weights[0] += 0.2;
    }

    /* premysliet
    if (nearestBone.children[0]) {
        this.bones.push(nearestBone.children[0]);
        this.weights.push(0.1);
    } else {
        this.weights[0] += 0.1;
    }*/

    //if nearestBone have more children which from them have influence on this skin point?
};
