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
    this.parent = !!parent;

    if (!this.parent) {
        this.angle = startPoint.radiansTo(endPoint);
    } else {
        this.angle = (-1) * (this.parent.startPoint.radiansTo(startPoint) - startPoint.radiansTo(endPoint));
        parent.addChild(this);
    }

    this.selected = false;
    this.highlighted = false;
}

Bone.prototype.LINE_WIDTH = 3;

Bone.prototype.setLength = function () {
    this.length = this.startPoint.getDistance(this.endPoint);
};


/**
 * Add child to parent bone. *
 * @this {Bone}
 * @param {Bone} child The child that will be added.
 * @returns {boolean} True if child was added successfully.
 */
Bone.prototype.addChild = function (child) {
    if (child instanceof Bone) {
        this.children.push(child);
        return true;
    } else {
        return false;
    }
};

/**
 * Calculate end point coordinates of bone.
 *
 * @this {Bone}
 * @returns {Point} End point coordinates of bone.
 */
Bone.prototype.getEndPoint = function () {
    var angle = this.angle;
    var currentBone = this.parent;
    while (currentBone instanceof Bone) {
        angle += currentBone.angle;
        currentBone = currentBone.parent;
    }

    this.endPoint.x = this.startPoint.x + Math.cos(angle) * this.length;
    this.endPoint.y = this.startPoint.y + Math.sin(angle) * this.length;
    return this.endPoint;
};

Bone.prototype.setStartPoint = function (point) {
    this.startPoint = point;
    if (this.children.length < 1) {
        this.getEndPoint();
    }
    for (var i = 0; i < this.children.length; i++) {
        this.children[i].setStartPoint(this.getEndPoint());
    }
};

/**
 *
 * @this {Bone}
 * @param angle The angle that will be setted.
 */
Bone.prototype.setAngle = function (angle) {
    this.angle = angle;
    for (var i = 0; i < this.children.length; i++) {
        this.children[i].setStartPoint(this.getEndPoint());
    }
    //this.angle += angle; //- mozno... rozhodne ondro
};

//  --------------------------------draw related
Bone.prototype.draw = function (context, selected) {
    var position1 = {x: this.startPoint.x, y: this.startPoint.y};
    var position2 = {x: this.endPoint.x, y: this.endPoint.y};
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

    for (var i in this.children) {
        if (this.children[i].containsPoint(point)) {
            return this.children[i];
        }
    }
    return false;
};

Bone.prototype.removeChild = function (bone) {
    for (var i in this.children) {
        if (this.children[i] == bone) {
            this.children.splice(i, 1);
        }
    }
};

Bone.prototype.highlightAll = function (value) {
    this.highlight(value);
    for (var i in this.children) {
        this.children[i].highlightAll(value);
    }
};

Bone.prototype.highlight = function (value) {
    this.highlighted = value;
    this.startPoint.highlighted = value;
    this.endPoint.highlighted = value;
};