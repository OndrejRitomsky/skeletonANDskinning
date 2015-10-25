/**
 * Creates an instance of Skin.
 *
 * @constructor
 */
function Skin() {
    this.points = [];
}

/**
 *  Add point to this skin.
 *
 * @param{SkinPoint} point The point to be added.
 */
Skin.prototype.addPoint = function (point) {
    this.points.push(point);
};

/**
 * Delete all skin points associated with this skin.
 *
 */
Skin.prototype.deleteAllPoints = function () {
    this.points.length = 0;
};

/**
 * Transform skin points.
 *
 */
Skin.prototype.transform = function () {
    for (var i = 0; i < this.points.length; i++) {
        this.points[i].transform();
    }
};

Skin.prototype.draw = function (context) {
    var position1, position2;
    for (var i = 1; i < this.points.length; i++) {
        position1 = this.points[i - 1].coordinates;
        position2 = this.points[i].coordinates;
        drawLine(context, position1, position2, DEFAULT_COLOR, 1);
    }
};

Skin.prototype.drawCap = function (context) {
    var position1, position2;
    position1 = this.points[this.points.length - 1].coordinates;
    position2 = this.points[0].coordinates;
    drawLine(context, position1, position2, DEFAULT_COLOR, 1);
};
