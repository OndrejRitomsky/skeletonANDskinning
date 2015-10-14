var CANVAS_STATES = {
    IDLE: 0,
    CREATING_SKELETON: 1,
    MOVE: 2,
    FORWARD_KINEMATICS: 3
};

var SELECTED_OBJECT_TYPE = {
    NONE: 0,
    POINT: 1,
    BONE: 2,
    ARRAY: 3
};

window.requestAF = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame;

function Canvas(canvas, context, app) {
    this.app = app;
    // dom object canvas
    this.canvas = canvas;
    this.context = context;
    this.width = 0;
    this.height = 0;
    this.bones = [];
    this.state = CANVAS_STATES.IDLE;
    this.mousePos = {x: 0, y: 0};

    var self = this;
    this.canvas.addEventListener("mousemove", function (ev) {
        self.onMouseMove(ev);
    });

    this.canvas.addEventListener("mouseup", function (ev) {
        self.onClick(ev);
    });

    this.canvas.oncontextmenu = function (ev) {
        ev.preventDefault();
    };

    this.resetAll();
    this.frame();

    this.selectedObject = null;
    this.selectedObjectType = SELECTED_OBJECT_TYPE.NONE;
    this.savedPosition = null;
}

Canvas.prototype.onClick = function (ev) {
    if (ev.which == 1) {
        var point = this.getCursorPosition(ev);
        this.leftClick(point, ev.ctrlKey);
    } else if (ev.which == 3) {
        this.cancelAll();
    }
};

Canvas.prototype.getCursorPosition = function (ev) {
    var x, y;
    if (ev.pageX || ev.pageY) {
        x = ev.pageX;
        y = ev.pageY;
    }
    else {
        x = ev.clientX + document.body.scrollLeft +
            document.documentElement.scrollLeft;
        y = ev.clientY + document.body.scrollTop +
            document.documentElement.scrollTop;
    }

    x -= this.canvas.offsetLeft;
    y -= this.canvas.offsetTop;

    return {x: x, y: y};
};

Canvas.prototype.leftClick = function (point, ctrlKey) {
    switch (this.state) {
        case CANVAS_STATES.IDLE:
            this.select(point);
            break;

        case CANVAS_STATES.MOVE:
            this.move(point);
            break;

        case CANVAS_STATES.CREATING_SKELETON:
            this.creatingSkeleton(point, ctrlKey);
            break;

        case CANVAS_STATES.FORWARD_KINEMATICS:
            this.forwardKinematics(point);
            break;
    }
};

Canvas.prototype.cancelAll = function () {
    this.resetState();

    if (this.savedPosition) {
        this.selectedObject.x = this.savedPosition.x;
        this.selectedObject.y = this.savedPosition.y;
        this.savedPosition = null;
    }
    this.deselect();
    this.app.setDescription("Use left click to select joint, which is useless");
};

Canvas.prototype.deselect = function () {
    if (this.selectedObject) {
        if (this.selectedObjectType == SELECTED_OBJECT_TYPE.BONE || this.selectedObjectType == SELECTED_OBJECT_TYPE.POINT) {
            this.selectedObject.deselect();

        } else if (this.selectedObjectType = SELECTED_OBJECT_TYPE.ARRAY) {
            for (var i = 0; i < this.selectedObject.length; i++) {
                this.selectedObject[i].deselect();
            }
        }
    }
    this.selectedObject = null;
    this.selectedObjectType = SELECTED_OBJECT_TYPE.NONE;
};

Canvas.prototype.resetState = function () {
    this.state = CANVAS_STATES.IDLE;
};

Canvas.prototype.onMouseMove = function (ev) {
    this.mousePos = this.getCursorPosition(ev);
};

Canvas.prototype.resize = function (width, height) {
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
};

Canvas.prototype.resizeToWindow = function () {
    var height = window.innerHeight - this.app.controlPanel.height() - 2;
    var width = window.innerWidth - this.app.editorPanel.width() - 12;
    this.resize(width, height);
};

Canvas.prototype.clear = function (color) {
    this.context.fillStyle = color || BACKGROUND_COLOR;
    this.context.fillRect(0, 0, this.width, this.height);
};

Canvas.prototype.resetAll = function () {
    this.clear();
    this.bones = [];
    this.resizeToWindow();
};

Canvas.prototype.frame = function () {
    this.clear();
    this.update();
    this.draw();

    var self = this;
    window.requestAF(function () {
        self.frame();
    });
};

Canvas.prototype.update = function () {
    if (this.state == CANVAS_STATES.MOVE && this.selectedObject) {
        this.selectedObject.x = this.mousePos.x;
        this.selectedObject.y = this.mousePos.y;
    }

    if (this.state == CANVAS_STATES.FORWARD_KINEMATICS && this.selectedObject) {
        var bone = this.selectedObject.bone;
        var angle = bone.startPoint.radiansTo(new Point(this.mousePos.x, this.mousePos.y));
        this.selectedObject.x = bone.startPoint.x + Math.cos(angle) * bone.length;
        this.selectedObject.y = bone.startPoint.y + Math.sin(angle) * bone.length;

        bone.setHighlightAll(true);
        var degInRad;
        if (bone.parent) {
            var startPoint = bone.parent.startPoint;
            degInRad = startPoint.radiansTo(bone.startPoint) - bone.startPoint.radiansTo(this.selectedObject);
            bone.setAngle(-1 * degInRad);
        } else {
            degInRad = bone.startPoint.radiansTo(this.selectedObject);
            bone.setAngle(degInRad);
        }
    }
};

Canvas.prototype.draw = function () {
    for (var i = 0; i < this.bones.length; i++) {
        this.bones[i].draw(this.context);
    }

    if (this.state == CANVAS_STATES.CREATING_SKELETON && this.selectedObject) {
        var position1 = {x: this.selectedObject.x, y: this.selectedObject.y};
        var position2 = {x: this.mousePos.x, y: this.mousePos.y};
        this.selectedObject.draw(this.context, true);
        drawLine(this.context, position1, position2, SELECTED_COLOR, Bone.prototype.LINE_WIDTH);
        drawDiskPart(this.context, position2, Point.prototype.RADIUS, SELECTED_COLOR, 0, 2 * Math.PI);

    } else if (this.state == CANVAS_STATES.CREATING_SKELETON && !this.selectedObject) {
        var position = {x: this.mousePos.x, y: this.mousePos.y};
        drawDiskPart(this.context, position, Point.prototype.RADIUS, SELECTED_COLOR, 0, 2 * Math.PI);
    }

    if (this.state == CANVAS_STATES.FORWARD_KINEMATICS && this.selectedObject) {
        this.selectedObject.bone.setHighlightAll(false);
    }
};

Canvas.prototype.creatingSkeleton = function (point, ctrlKey) {
    if (!this.selectedObject) {
        this.selectedObject = new Point(point.x, point.y);
        return;
    }
    if (!(this.selectedObject instanceof Point)) {
        return;
    }

    var startPoint = this.selectedObject;
    var endPoint = new Point(point.x, point.y);
    var bone = new Bone(startPoint, endPoint, this.selectedObject.bone);

    endPoint.bone = bone;
    this.bones.push(bone);
    if (!ctrlKey) {
        this.selectedObject = endPoint;
    }
};

Canvas.prototype.positionCollideWithAnyPoint = function (point) {
    for (var i = 0; i < this.bones.length; i++) {
        var collidedPoint = this.bones[i].positionCollide(point);
        if (collidedPoint) {
            return collidedPoint;
        }
    }
    return null;
};

Canvas.prototype.select = function (position) {
    var selectedPoint = this.positionCollideWithAnyPoint(position);

    if (!selectedPoint || selectedPoint.selected) {
        return;
    }

    var self = this;

    function defaultPointSelect(point) {
        self.deselect();
        point.select();
        self.selectedObject = point;
        self.selectedObjectType = SELECTED_OBJECT_TYPE.POINT;
    }

    if (!this.selectedObject) {
        defaultPointSelect(selectedPoint);
        return;
    }

    // TODO fix bug with skeleton one point being parent of two points
    if (this.selectedObjectType == SELECTED_OBJECT_TYPE.POINT) {
        var bone = this.selectedObject.bone;
        if (bone && bone.containsPoint(selectedPoint)) {
            // we selected second point of bone
            bone.select();
            this.selectedObject = bone;
            this.selectedObjectType = SELECTED_OBJECT_TYPE.BONE;
            return;
        }

        bone = selectedPoint.bone;
        if (bone && bone.containsPoint(selectedPoint)) {
            bone.select();
            this.selectedObject = bone;
            this.selectedObjectType = SELECTED_OBJECT_TYPE.BONE;
        } else {
            defaultPointSelect(selectedPoint);
        }

    } else if (this.selectedObjectType == SELECTED_OBJECT_TYPE.BONE) {
        var connectedBone = this.selectedObject.isPointConnected(selectedPoint);
        if (connectedBone) {
            connectedBone.select();
            this.selectedObject = [this.selectedObject, connectedBone];
            this.selectedObjectType = SELECTED_OBJECT_TYPE.ARRAY;
        } else {
            defaultPointSelect(selectedPoint);
        }

    } else if (this.selectedObjectType == SELECTED_OBJECT_TYPE.ARRAY) {
        for (var i = 0; i < this.selectedObject.length; i++) {
            connectedBone = this.selectedObject[i].isPointConnected(selectedPoint);
            if (connectedBone) {
                connectedBone.select();
                this.selectedObject.push(connectedBone);
                return;
            }
        }
    }
};

Canvas.prototype.drawSkeletonButtonClick = function () {
    var selectedPoint = this.selectedObject;
    this.cancelAll();
    if (selectedPoint instanceof Point) {
        this.selectedObject = selectedPoint;
    }
    this.state = CANVAS_STATES.CREATING_SKELETON;
};

Canvas.prototype.moveButtonClick = function () {
    var selectedPoint = this.selectedObject;
    this.cancelAll();
    if (this.selectedObjectType == SELECTED_OBJECT_TYPE.POINT) {
        this.selectedObject = selectedPoint;
        selectedPoint.select();
        this.app.setDescription("You can move joint, choose position and left click to finish or right click to cancel command.");
    }
    this.state = CANVAS_STATES.MOVE;
};

Canvas.prototype.move = function (point) {
    if (!this.selectedObject) {
        this.select(point);
        if (this.selectedObject) {
            this.savedPosition = {x: this.selectedObject.x, y: this.selectedObject.y};
            this.app.setDescription("You can move joint, choose position and left click to finish or right click to cancel command.");
        }
        return;
    }

    if (this.selectedObject) {
        var bone = this.selectedObject.bone;

        // TODO fix with endpoint correction
        if (bone.parent){
            bone.parent.recalculateAngle();
        }
        bone.recalculateAngle();

        for (var i = 0; i < bone.children; i++){
            bone.children[i].recalculateAngle();
        }

        this.savedPosition = null;
        this.app.setDescription("You can move joint, start by selecting one.");
        this.deselect();
    }
};

Canvas.prototype.forwardKinematics = function (point) {
    if (!this.selectedObject) {
        this.select(point);
        if (this.selectedObject) {
            this.app.setDescription("Choose new position.");
        }
        return;
    }

    if (this.selectedObject) {
        this.cancelAll();
    }
};

Canvas.prototype.forwardKinematicsButtonClick = function () {
    this.cancelAll();
    this.state = CANVAS_STATES.FORWARD_KINEMATICS;
};

// TODO tieto hlupe kontroly na instance tu nemusia byt, staci disablovat toto tlacitko podla selectu, napr dame classy
// ze ake selecty podporuje
Canvas.prototype.destroyButtonClick = function () {
    if (!this.selectedObject) {
        return;
    }

    if (this.selectedObjectType == SELECTED_OBJECT_TYPE.POINT) {
        return;
    }

    var self = this;
    function removeBone(bone){
        var parent = bone.parent;
        var children = bone.children;
        var i;
        if (!parent && children.length > 0) {
            console.log("a");
            for (i = 0; i < children.length; i++) {
                children[i].parent = null;
                children[i].recalculateAngle();
            }
            self.removeBone(bone);

        } else if (parent) {
            parent.removeChild(bone);
            for (i = 0; i < children.length; i++) {
                parent.children.push(children[i]);
                children[i].parent = parent;
                children[i].startPoint = parent.endPoint;
                children[i].recalculateAngle();  //  A   C    D
            }
            self.removeBone(bone);
            console.log(self.bones);

        } else if (!parent && children.length == 0) {
            console.log("c");
            self.removeBone(bone);
        }
    }

    if (this.selectedObjectType == SELECTED_OBJECT_TYPE.BONE) {
        removeBone(this.selectedObject);

    } else if (this.selectedObjectType == SELECTED_OBJECT_TYPE.ARRAY) {
        for (var i = 0; i < this.selectedObject.length; i++){
            removeBone(this.selectedObject[i]);
        }
    }

    this.deselect();
};

Canvas.prototype.removeBone = function (bone) {
    for (var i = 0; i < this.bones.length; i++) {
        if (this.bones[i] == bone) {
            this.bones.splice(i, 1);
        }
    }
};
