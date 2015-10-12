function Point(x, y, selected) {
    this.x = x || 0;
    this.y = y || 0;
    this.selected = !!selected;
    this.bone = null;
}

Point.prototype.RADIUS = 5;

Point.prototype.getDistance = function (point) {
    return Math.sqrt(Math.pow(this.x - point.x, 2) + Math.pow(this.y - point.y, 2));
};

Point.prototype.toString = function () {
    return "(x=" + this.x + ", y=" + this.y + ")";
};

Point.prototype.radiansTo = function (point) {
    var dx = point.x - this.x;
    var dy = point.y - this.y;
    return Math.atan2(dy, dx);
};

Point.prototype.draw = function (context, selected) {
    context.beginPath();
    context.fillStyle = selected || this.selected ? SELECTED_COLOR : DEFAULT_COLOR;
    context.arc(this.x, this.y, this.RADIUS, 0, 2 * Math.PI);
    context.fill();
};

Point.prototype.positionCollide = function (position) {
    var distance = this.getDistance(new Point(position.x, position.y));
    if (distance <= this.RADIUS){
        return this;
    }
    return false;
};