/**
 * Creates an instance of Bone.
 *
 * @constructor
 * @this {Bone}
 * @param startPoint Start point of bone.
 * @param endPoint Endpoint of bone.
 * @param parent Parent of created bone.
 */
function Bone(startPoint, endPoint, parent) {
    this.startPoint = startPoint;
    this.endPoint = endPoint;

    this.children = [];
    this.length = startPoint.getDistance(endPoint);
    this.parent = parent;

    if (!this.parent) {
        this.angle = startPoint.radiansTo(endPoint);
    } else {
        this.angle = startPoint.radians2To(this.parent.startPoint, endPoint);
        parent.children.push(this);
    }

    this.selected = false;
    this.highlighted = false;
}

Bone.prototype.LINE_WIDTH = 3;

/**
 * Calculate and set end point coordinates of bone.
 *
 * @this {Bone}
 * @returns {Array} End point position
 */
Bone.prototype.recalculateEndPoint = function () {
    var angle = this.angle;
    var currentBone = this.parent;
    while (currentBone) {
        angle += currentBone.angle;
        currentBone = currentBone.parent;
    }

    var position, startPosition = this.startPoint.position;
    if (this.children[0]) {
        position = [0, 0];
        position[0] = startPosition[0] + Math.cos(angle) * this.length;
        position[1] = startPosition[1] + Math.sin(angle) * this.length;
        for (var i = 0; i < this.children.length; i++) {
            this.children[i].startPoint.position = position;
        }
    } else {
        position = this.endPoint.position;
        position[0] = startPosition[0] + Math.cos(angle) * this.length;
        position[1] = startPosition[1] + Math.sin(angle) * this.length;
    }
    return position;
};

/**
 * Set position of startPoint
 *
 * @param {Array} position New position.
 */
Bone.prototype.setStartPoint = function (position){
    this.startPoint.position = position;
};

/**
 * Set start point of bone and calculate start point of all its children.
 *
 * @this{Bone}
 * @param {Array} position New position.
 */
Bone.prototype.recalculateStartPoint = function (position) {
    this.setStartPoint(position);
    var endPointPosition = this.recalculateEndPoint();
    for (var i = 0; i < this.children.length; i++) {
        this.children[i].recalculateStartPoint(endPointPosition);
    }
};

/**
 * Forward kinematics function which set angle of selected bone and then translate all its children.
 *
 * @this {Bone}
 * @param {number} angle The angle in radians that will be setted.
 */
Bone.prototype.setAngle = function (angle) {
    this.angle = angle;
    for (var i = 0; i < this.children.length; i++) {
        this.children[i].recalculateStartPoint(this.recalculateEndPoint());
    }
};

/**
 * Calculate and set angle form start point to given end point.
 *
 * @this {Bone}
 * @param {Point} endPoint The end point which with start point make new angle.
 */
Bone.prototype.recalculateAngle = function (endPoint) {
    if (!this.parent) {
        this.angle = this.startPoint.radiansTo(endPoint);
    } else {
        this.angle = this.startPoint.radians2To(this.parent.startPoint, endPoint);
    }
};

/**
 * Calculate and set length of bone.
 *
 * @this {Bone}
 */
Bone.prototype.recalculateLength = function () {
    this.length = this.endPoint.getDistance(this.startPoint);
};

Bone.prototype.draw = function (context, selected) {
    var position1 = this.startPoint.position;
    var position2 = this.endPoint.position;
    var color = selected || this.selected ? SELECTED_COLOR : DEFAULT_COLOR;
    color = this.highlighted ? HIGHLIGHT_COLOR : color;
    drawLine(context, position1, position2, color, this.LINE_WIDTH);
    this.startPoint.draw(context, selected);
    this.endPoint.draw(context, selected);
};

Bone.prototype.positionCollide = function (position) {
    return this.startPoint.positionCollide(position) || this.endPoint.positionCollide(position);
};

Bone.prototype.select = function (){
    this.startPoint.select();
    this.endPoint.select();
    this.selected = true;
};

Bone.prototype.deselect = function (){
    this.startPoint.deselect();
    this.endPoint.deselect();
    this.selected = false;
};

Bone.prototype.containsPoint = function (point) {
    return (this.startPoint == point || this.endPoint == point);
};

Bone.prototype.isPointConnected = function (point) {
    if (this.parent && this.parent.containsPoint(point)) {
        return this.parent;
    }

    for (var i = 0; i < this.children.length; i++) {
        if (this.children[i].containsPoint(point)) {
            return this.children[i];
        }
    }
    return false;
};

Bone.prototype.removeChild = function (bone) {
    for (var i = 0; i < this.children.length; i++) {
        if (this.children[i] == bone) {
            this.children.splice(i, 1);
        }
    }
};

Bone.prototype.setHighlightAll = function (value) {
    this.setHighlight(value);
    for (var i = 0; i < this.children.length; i++) {
        this.children[i].setHighlightAll(value);
    }
};

Bone.prototype.setHighlight = function (value) {
    this.highlighted = value;
    this.startPoint.highlighted = value;
    this.endPoint.highlighted = value;
};

Bone.prototype.isInRectangle = function(pos1, pos2){
    function pointIsInRectangle(pointPosition, startPos, endPos) {
        return pointPosition[0] < endPos[0] && pointPosition[0] > startPos[0]
                && pointPosition[1] < endPos[1] && pointPosition[1] > startPos[1];
    }
    var minPos = [0, 0], maxPos = [0, 0];
    minPos[0] = pos1[0] < pos2[0] ? pos1[0] : pos2[0];
    maxPos[0] = pos1[0] > pos2[0] ? pos1[0] : pos2[0];

    minPos[1] = pos1[1] < pos2[1] ? pos1[1] : pos2[1];
    maxPos[1] = pos1[1] > pos2[1] ? pos1[1] : pos2[1];

    return pointIsInRectangle(this.startPoint.position, minPos, maxPos) && pointIsInRectangle(this.endPoint.position, minPos, maxPos);
};