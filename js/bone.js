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

    if(!this.parent){
        this.angle = startPoint.radiansTo(endPoint);
    } else {
        this.angle = (-1)*(this.parent.startPoint.radiansTo(startPoint) - startPoint.radiansTo(endPoint));
        parent.addChild(this);
    }
}

Bone.prototype.setLength = function() {
    this.length =  this.startPoint.getDistance(this.endPoint);
};


/**
 * Add child to parent bone. *
 * @this {Bone}
 * @param {Bone} child The child that will be added.
 * @returns {boolean} True if child was added successfully.
 */
Bone.prototype.addChild = function(child) {
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
Bone.prototype.getEndPoint = function() {
    var angle = this.angle;
    var currentBone = this.parent;
    while(currentBone instanceof Bone){
        angle += currentBone.angle;
        currentBone = currentBone.parent;
    }

    this.endPoint.x = this.startPoint.x + Math.cos(angle)*this.length;
    this.endPoint.y = this.startPoint.y + Math.sin(angle)*this.length;
    return this.endPoint;
};


Bone.prototype.setStartPoint = function(point) {
    this.startPoint = point;
    if (this.children.length < 1){
        this.getEndPoint();
    }
    for(var i = 0; i < this.children.length; i++){
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
    context.beginPath();
    context.lineWidth = 3;
    context.strokeStyle = selected ? SELECTED_COLOR : DEFAULT_COLOR;
    context.moveTo(this.startPoint.x, this.startPoint.y);
    context.lineTo(this.endPoint.x, this.endPoint.y);
    context.stroke();
    this.startPoint.draw(context, selected);
    this.endPoint.draw(context, selected);
};

Bone.prototype.positionCollide = function (position) {
    return this.startPoint.positionCollide(position) || this.endPoint.positionCollide(position);
};
Bone.prototype.deselect = function (){
    this.startPoint.selected = false;
    this.endPoint.selected = false;
};