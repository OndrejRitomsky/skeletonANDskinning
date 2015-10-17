/**
 * Creates an instance of Bone.
 *
 * @constructor
 * @this {Bone}
 * @param startPoint Start point of Bone.
 * @param endPoint Endpoint of Bone.
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
 * @returns {Point} End point of bone.
 */
Bone.prototype.recalculateEndPoint = function () {
    var angle = this.angle;
    var currentBone = this.parent;
    while (currentBone instanceof Bone) {
        angle += currentBone.angle;
        currentBone = currentBone.parent;
    }

    if(this.children[0]) {
        for(var i = 0; i < this.children.length; i++){
            this.children[i].startPoint.x = this.startPoint.x + Math.cos(angle) * this.length;
            this.children[i].startPoint.y = this.startPoint.y + Math.sin(angle) * this.length;
        }
        return this.children[0].startPoint;
    } else {
        this.endPoint.x = this.startPoint.x + Math.cos(angle) * this.length;
        this.endPoint.y = this.startPoint.y + Math.sin(angle) * this.length;
        return this.endPoint;
    }
};

/**
 * Return end point of bone.
 *
 * @this{Bone}
 * @returns {Point} End point of bone.
 */
Bone.prototype.getEndPoint = function () {
    if(!this.children[0]){
        return this.endPoint;
    }else {
        return this.children[0].startPoint;
    }
};

/**
 * Set coordinates of start point to coordinates of point.
 *
 * @param {Point} point Point with new coordinates.
 */
Bone.prototype.setStartPoint = function (point){
    this.startPoint.x = point.x;
    this.startPoint.y = point.y;
};

/**
 * Set start point of bone and calculate start point of all its children.
 *
 * @this{Bone}
 * @param {Point} point New start point of bone.
 */
Bone.prototype.recalculateStartPoint = function (point) {
    this.setStartPoint(point);
    if (this.children.length < 1) {
        this.recalculateEndPoint();
    }
    for (var i = 0; i < this.children.length; i++) {
        this.children[i].recalculateStartPoint(this.recalculateEndPoint());
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

Bone.prototype.recalculateAngle = function (endPoint) {
    if (!this.parent) {
        this.angle = this.startPoint.radiansTo(endPoint);
    } else {
        this.angle = this.startPoint.radians2To(this.parent.startPoint, endPoint);
    }
};

Bone.prototype.recalculateLength = function () {
    this.length = this.getEndPoint().getDistance(this.startPoint);
};

Bone.prototype.draw = function (context, selected) {
    var position1 = {x: this.startPoint.x, y: this.startPoint.y};
    var position2 = {x: this.getEndPoint().x, y: this.getEndPoint().y};
    var color = selected || this.selected ? SELECTED_COLOR : DEFAULT_COLOR;
    color = this.highlighted ? HIGHLIGHT_COLOR : color;
    drawLine(context, position1, position2, color, this.LINE_WIDTH);
    this.startPoint.draw(context, selected);
    this.getEndPoint().draw(context, selected);
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
    function pointIsInRectangle(point, pos1, pos2) {
        return point.x < pos2.x && point.x > pos1.x && point.y < pos2.y && point.y > pos1.y;
    }

    return pointIsInRectangle(this.startPoint, pos1, pos2) && pointIsInRectangle(this.endPoint, pos1, pos2);
};