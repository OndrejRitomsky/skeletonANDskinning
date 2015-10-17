function Point(x, y) {
    this.x = x || 0;
    this.y = y || 0;
    this.bone = null;
    this.highlighted = false;
    this.selected = false;
}

Point.prototype.RADIUS = 5;

/**
 * Calculate distance between two point.
 *
 * @this{Point}
 * @param point The second point.
 * @returns {number} Distance between two point.
 */
Point.prototype.getDistance = function (point) {
    return Math.sqrt(Math.pow(this.x - point.x, 2) + Math.pow(this.y - point.y, 2));
};

/**
 * Calculate angle in radians between X Axis and line assigned by two points.
 *
 * @this{Point}
 * @param point The second point of line.
 * @returns {number} Angle in radians between X Axis and line assigned by two points.
 */
Point.prototype.radiansTo = function (point) {
    var dx = point.x - this.x;
    var dy = point.y - this.y;
    return Math.atan2(dy, dx);
};

/**
 * Calculate angle between line assigned by point p1 and this point and line assigned by this point and point p2.
 *
 * @param p1 Point of first line.
 * @param p2 Point of second line.
 * @returns {number} angle between lines
 */
Point.prototype.radians2To = function (p1, p2){
    return (-1) * (p1.radiansTo(this) - this.radiansTo(p2));
};

Point.prototype.draw = function (context, selected) {
    var position = {x: this.x, y: this.y};
    var color = this.selected || selected ? SELECTED_COLOR : DEFAULT_COLOR;
    color = this.highlighted ? HIGHLIGHT_COLOR : color;
    drawDiskPart(context, position, this.RADIUS, color, 0, 2*Math.PI);
};

Point.prototype.positionCollide = function (position) {
    var distance = this.getDistance(new Point(position.x, position.y));
    if (distance <= this.RADIUS){
        return this;
    }
    return false;
};

Point.prototype.deselect = function(){
    this.selected = false;
};


Point.prototype.select = function(){
    this.selected = true;
};

Point.prototype.toString = function () {
    return "(x=" + this.x + ", y=" + this.y + ")";
};

