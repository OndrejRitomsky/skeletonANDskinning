var CANVAS_STATES = {
    IDLE: 0,
    CREATING_SKELETON: 1,
    MOVE: 2,
    FORWARD_KINEMATICS: 3
};

var CREATING_SKELETON_STATES = {
    START: 0,
    END_BONE: 1
};

var DEFAULT_COLOR = "#000000";
var SELECTED_COLOR = "#ff0000";
var BACKGROUND_COLOR = "#ffffff"

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

    this.objects = [];
    this.editObjects = [];

    this.state = CANVAS_STATES.IDLE;
    this.creationSkeletonState = CREATING_SKELETON_STATES.START;

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

    this.selectedPoint = null;
    this.savedPosition = null;
}

Canvas.prototype.onClick = function (ev) {
    if (ev.which == 1) {
        var point = this.getCursorPosition(ev);
        this.leftClick(point);
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

Canvas.prototype.leftClick = function (point) {
    switch (this.state){
        case CANVAS_STATES.IDLE:
            this.select(point);
            break;

        case CANVAS_STATES.MOVE:
            this.move(point);
            break;

        case CANVAS_STATES.CREATING_SKELETON:
            this.creatingSkeleton(point);
            break;

        case CANVAS_STATES.FORWARD_KINEMATICS:
            this.forwardKinematics(point);
            break;
    }
};

Canvas.prototype.cancelAll = function () {
    this.editObjects = [];
    this.resetState();

    if (this.savedPosition){
        this.selectedPoint.x = this.savedPosition.x;
        this.selectedPoint.y = this.savedPosition.y;
        this.savedPosition = null;
    }
    this.deselect();
    this.app.setDescription("Use left click to select joint, which is useless");
};

Canvas.prototype.deselect = function(){
    if (this.selectedPoint) {
        this.selectedPoint.selected = false;
    }
    this.selectedPoint = null;
};

Canvas.prototype.resetState = function () {
    this.state = CANVAS_STATES.IDLE;
    this.creationSkeletonState = CREATING_SKELETON_STATES.START;
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
    this.objects = [];
    this.resizeToWindow();
};

Canvas.prototype.frame = function () {
    this.clear();
    this.draw();

    var self = this;
    window.requestAF(function () {
        self.frame();
    });
};


Canvas.prototype.draw = function () {
    // update f
    if (this.state == CANVAS_STATES.MOVE && this.selectedPoint) {
        this.selectedPoint.x = this.mousePos.x;
        this.selectedPoint.y = this.mousePos.y;
    }

    // update f
    if (this.state == CANVAS_STATES.FORWARD_KINEMATICS  && this.selectedPoint) {
        this.selectedPoint.x = this.mousePos.x;
        this.selectedPoint.y = this.mousePos.y;
        // adjust others

        var bone = this.selectedPoint.bone;
        bone.setLength();

        var startPoint = bone.parent.startPoint;

        var degInRad = startPoint.radiansTo(bone.startPoint)  - bone.startPoint.radiansTo(this.selectedPoint);
        bone.setAngle(-1 * degInRad);
    }

    for (var i in this.objects) {
        if (this.objects[i].draw) {
            this.objects[i].draw(this.context);
        }
    }

    for (i in this.editObjects) {
        if (this.editObjects[i].draw) {
            this.editObjects[i].draw(this.context, true);
        }
    }

    if (this.state != CANVAS_STATES.IDLE && this.editObjects.length > 0) {
        var point = this.editObjects[this.editObjects.length - 1];
        this.context.beginPath();
        this.context.lineWidth = 3;
        this.context.strokeStyle = SELECTED_COLOR;
        this.context.moveTo(point.x, point.y);
        this.context.lineTo(this.mousePos.x, this.mousePos.y);
        this.context.stroke();
    }
};

Canvas.prototype.creatingSkeleton = function (point) {
    switch (this.creationSkeletonState) {
        case CREATING_SKELETON_STATES.START:
            this.editObjects.push(new Point(point.x, point.y));
            this.creationSkeletonState = CREATING_SKELETON_STATES.END_BONE;
            break;

        case CREATING_SKELETON_STATES.END_BONE:
            var points = this.editObjects;
            var startPoint = points.splice(points.length - 1, 1)[0];
            var endPoint = new Point(point.x, point.y);

            var bone = new Bone(startPoint, endPoint);
            if (startPoint.bone){
                startPoint.bone.children.push(bone);
                bone.parent = startPoint.bone;
            }
            endPoint.bone = bone;
            this.objects.push(bone);
            this.editObjects.push(endPoint);
            break;
    }
};

Canvas.prototype.select = function (point){
    var selectedObject = null;
    for (var i in this.objects){
        if (this.objects[i].positionCollide){
            var collidedObject = this.objects[i].positionCollide(point);
            if (collidedObject){
                selectedObject = collidedObject;
            }
        }
    }
    if (selectedObject){
        this.deselect();
        selectedObject.selected = true;
        this.selectedPoint = selectedObject;
    }
};

Canvas.prototype.drawSkeletonButtonClick = function () {
    var selectedPoint = this.selectedPoint;
    this.cancelAll();
    this.state = CANVAS_STATES.CREATING_SKELETON;

    if(selectedPoint){
        this.creationSkeletonState = CREATING_SKELETON_STATES.END_BONE;
        this.editObjects.push(selectedPoint);
        this.selectedPoint = selectedPoint;
    } else {
        this.creationSkeletonState = CREATING_SKELETON_STATES.START;
    }
};

Canvas.prototype.moveButtonClick = function () {
    this.cancelAll();
    this.state = CANVAS_STATES.MOVE;
};

Canvas.prototype.move = function (point){
    if (!this.selectedPoint){
        this.select(point);
        if (this.selectedPoint) {
            this.savedPosition = {x: this.selectedPoint.x, y: this.selectedPoint.y};
            this.app.setDescription("You can move joint, choose position and left click to finish or right click to cancel command.");
        }
        return;
    }

    if (this.selectedPoint){
        this.savedPosition = null;
        this.app.setDescription("You can move joint, start by selecting one.");
        this.deselect();
    }
};

Canvas.prototype.forwardKinematics = function (point){
    if (!this.selectedPoint){
        this.select(point);
        if (this.selectedPoint) {
            this.app.setDescription("Choose new position.");
        }
        return;
    }

    if (this.selectedPoint){
        this.cancelAll();
    }
};

Canvas.prototype.forwardKinematicsButtonClick = function (point){
    this.cancelAll();
    this.state = CANVAS_STATES.FORWARD_KINEMATICS;
};