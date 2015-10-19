function Point(position) {
    this.position = position;
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
    var diff = numeric['-'](this.position, point.position);
    return Math.sqrt(Math.pow(diff[0], 2) + Math.pow(diff[1], 2));
};

/**
 * Calculate angle in radians between X Axis and line assigned by two points.
 *
 * @this{Point}
 * @param point The second point of line.
 * @returns {number} Angle in radians between X Axis and line assigned by two points.
 */
Point.prototype.radiansTo = function (point) {
    var diff = numeric['-'](point.position, this.position);
    return Math.atan2(diff[1], diff[0]);
};

/**
 * Calculate angle between line assigned by point p1 and this point and line assigned by this point and point p2.
 *
 * @param p1 Point of first line.
 * @param p2 Point of second line.
 * @returns {number} angle between lines
 */
Point.prototype.radians2To = function (p1, p2) {
    return (-1) * (p1.radiansTo(this) - this.radiansTo(p2));
};

Point.prototype.draw = function (context, selected) {
    var color = this.selected || selected ? SELECTED_COLOR : DEFAULT_COLOR;
    color = this.highlighted ? HIGHLIGHT_COLOR : color;
    drawDiskPart(context, this.position, this.RADIUS, color, 0, 2 * Math.PI);
};

Point.prototype.positionCollide = function (position) {
    var distance = this.getDistance(new Point(position));
    if (distance <= this.RADIUS) {
        return this;
    }
    return false;
};

Point.prototype.deselect = function () {
    this.selected = false;
};


Point.prototype.select = function () {
    this.selected = true;
};

Point.prototype.toString = function () {
    return "(x=" + this.position[0] + ", y=" + this.position[1] + ")";
};

