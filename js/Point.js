function Point(x, y, selected) {
    this.x = x || 0;
    this.y = y || 0;
    this.selected = selected || !!selected;
    this.bone = null;
    this.highlighted = false;
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

