var CANVAS_STATES = {
    IDLE: 0,
    CREATING_SKELETON: 1,
    SELECTION: 3,
    FENCE_SELECTION: 4,
    MOVE: 5,
    FORWARD_KINEMATICS: 6,
    DRAW_SKIN: 7
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
    this.skin = new Skin();
    this.state = CANVAS_STATES.IDLE;
    this.mousePos = [-1, -1, 1];

    var self = this;
    this.canvas.addEventListener("mousemove", function (ev) {
        self.mousePos = self.getCursorPosition(ev);
    });

    this.canvas.addEventListener("mouseup", function (ev) {
        self.onClick(ev);
    });

    this.canvas.oncontextmenu = function (ev) {
        ev.preventDefault();
    };

    window.addEventListener("resize",
        function () {
            self.resizeToWindow();
        }
        , false);

    this.resetAll();
    this.frame();

    this.selectedObject = null;
    var selectedObjectType;
    // TODO this might be reworked, since we disable buttons on mouse click
    Object.defineProperty(this, "selectedObjectType", {
        set: function (value) {
            selectedObjectType = value;
            if (self.state == CANVAS_STATES.IDLE || self.state == CANVAS_STATES.SELECTION
                || self.state == CANVAS_STATES.FENCE_SELECTION) {
                self.app.enabledDisableButtons(value);
            }
        },
        get: function(){
            return selectedObjectType;
        }
    });

    this.savedPosition = null;
    this.app.setDescription(Resources.default);
}

Canvas.prototype.SKIN_CLICK_MIN_DISTANCE = 10;

Canvas.prototype.onClick = function (ev) {
    this.app.enabledDisableButtons(this.selectedObjectType);
    if (ev.which == 1) {
        var position = this.getCursorPosition(ev);
        this.leftClick(position, ev.ctrlKey);
    } else if (ev.which == 3) {
        this.cancelAll();
    }
    this.app.enabledDisableButtons(this.selectedObjectType);
};

Canvas.prototype.getCursorPosition = function (ev) {
    var position = [0, 0, 1];
    if (ev.pageX || ev.pageY) {
        position[0] = ev.pageX;
        position[1] = ev.pageY;
    }
    else {
        position[0] = ev.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        position[1] = ev.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }

    position[0] -= this.canvas.offsetLeft;
    position[1] -= this.canvas.offsetTop;

    return position;
};

Canvas.prototype.leftClick = function (position, ctrlKey) {
    switch (this.state) {
        case CANVAS_STATES.SELECTION:
            this.select(position);
            break;

        case CANVAS_STATES.FENCE_SELECTION:
            this.fenceSelect(position);
            break;

        case CANVAS_STATES.MOVE:
            this.move(position);
            break;

        case CANVAS_STATES.CREATING_SKELETON:
            this.creatingSkeleton(position, ctrlKey);
            break;

        case CANVAS_STATES.FORWARD_KINEMATICS:
            this.forwardKinematics(position);
            break;

        case CANVAS_STATES.DRAW_SKIN:
            this.createSkin(position, ctrlKey);
            break;
    }
};

Canvas.prototype.cancelAll = function () {
    if (this.savedPosition && this.state == CANVAS_STATES.MOVE && this.selectedObjectType == SELECTED_OBJECT_TYPE.POINT) {
        this.selectedObject.position = this.savedPosition;
    }
    if (this.skin.points.length == 1){
        // One point cant be seen but is disabling move so remove it
        this.skin.points = [];
    }
    this.savedPosition = null;
    this.resetState();
    this.deselect();

    this.app.setDescription(Resources.default);
    if (this.app.activeButton){
        this.app.activeButton.parents('.btnContainer').removeClass("active");
        this.app.activeButton = null;
    }
};

Canvas.prototype.deselect = function () {
    if (this.selectedObject) {
        if (this.selectedObjectType == SELECTED_OBJECT_TYPE.BONE || this.selectedObjectType == SELECTED_OBJECT_TYPE.POINT) {
            this.selectedObject.deselect();

        } else if (this.selectedObjectType == SELECTED_OBJECT_TYPE.ARRAY) {
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

Canvas.prototype.resize = function (width, height) {
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
};

Canvas.prototype.resizeToWindow = function () {
    var height = window.innerHeight - this.app.controlPanel.height() - 2;
    var width = window.innerWidth;
    this.resize(width, height);
};

Canvas.prototype.clearCanvas = function (color) {
    this.context.fillStyle = color || BACKGROUND_COLOR;
    this.context.fillRect(0, 0, this.width, this.height);
};

Canvas.prototype.resetAll = function () {
    this.bones = [];
    this.skin.deleteAllPoints();
    this.deselect();
    this.clearCanvas();
    this.resizeToWindow();
    this.state = CANVAS_STATES.IDLE;
    this.app.setDescription(Resources.default);
};

Canvas.prototype.frame = function () {
    this.clearCanvas();
    this.update();
    this.draw();

    var self = this;
    window.requestAF(function () {
        self.frame();
    });
};

Canvas.prototype.update = function () {
    if (this.state == CANVAS_STATES.MOVE && this.selectedObject) {
        this.selectedObject.position = this.mousePos;
    }

    if (this.state == CANVAS_STATES.FORWARD_KINEMATICS && this.selectedObjectType == SELECTED_OBJECT_TYPE.BONE) {
        var bone = this.selectedObject;

        var endPoint = bone.endPoint;
        var startPoint = bone.startPoint;

        var angle = bone.startPoint.radiansTo(new Point(this.mousePos));
        endPoint.position[0] = startPoint.position[0] + Math.cos(angle) * bone.length;
        endPoint.position[1] = startPoint.position[1] + Math.sin(angle) * bone.length;

        bone.setHighlightAll(true);
        var degInRad = bone.parent ? bone.startPoint.radians2To(bone.parent.startPoint, endPoint) :
                                     bone.startPoint.radiansTo(endPoint);

        bone.addFWKTransformation(bone.startPoint, bone.cachedAngle - degInRad);
        bone.setAngle(degInRad);
        this.skin.transform(bone, bone.cachedAngle - degInRad);
    }
};

Canvas.prototype.draw = function () {
    for (var i = 0; i < this.bones.length; i++) {
        this.bones[i].draw(this.context);
    }

    this.skin.draw(this.context);
    if (this.state != CANVAS_STATES.DRAW_SKIN && this.skin.points.length > 2) {
        this.skin.drawCap(this.context);
    }

    if (this.state == CANVAS_STATES.DRAW_SKIN && this.skin.points.length != 0) {
        var position1 = this.skin.points[this.skin.points.length - 1].coordinates;
        drawLine(this.context, position1, this.mousePos, DEFAULT_COLOR, 1);
    }

    if (this.state == CANVAS_STATES.CREATING_SKELETON && this.selectedObject) {
        var position1 = this.selectedObject.position;
        drawBoneLine(this.context, position1, this.mousePos, SELECTED_COLOR, SELECTED_BONE_TIP_COLOR, Bone.prototype.LINE_WIDTH);
        drawDiskPart(this.context, position1, Point.prototype.RADIUS, DEFAULT_COLOR, 0, 2 * Math.PI);
        drawDiskPart(this.context, this.mousePos, Point.prototype.RADIUS, SELECTED_COLOR, 0, 2 * Math.PI);

    } else if (this.state == CANVAS_STATES.CREATING_SKELETON && !this.selectedObject) {
        drawDiskPart(this.context, this.mousePos, Point.prototype.RADIUS, SELECTED_COLOR, 0, 2 * Math.PI);
    }

    if (this.state == CANVAS_STATES.FORWARD_KINEMATICS && this.selectedObjectType == SELECTED_OBJECT_TYPE.BONE) {
        this.selectedObject.setHighlightAll(false);
    }

    if (this.state == CANVAS_STATES.FENCE_SELECTION && this.savedPosition) {
        var diff = numeric['-'](this.mousePos, this.savedPosition);
        drawRect(this.context, this.savedPosition, diff[0], diff[1], FENCE_COLOR);
    }
};

Canvas.prototype.createSkin = function (position, ctrlKey) {
    var length = this.skin.points.length;
    var lastPoint = length > 0 ? this.skin.points[length - 1] : null;
    var skinPoint;
    if (ctrlKey && lastPoint) {
        var diff = numeric['-'](position, lastPoint.coordinates);
        var distance = Math.sqrt(Math.pow(diff[0], 2) + Math.pow(diff[1], 2));

        var k = Math.floor(distance / Canvas.prototype.SKIN_CLICK_MIN_DISTANCE);
        var dx = diff[0] / k;
        var dy = diff[1] / k;
        for (var i = 0; i < k; i++) {
            var x = lastPoint.coordinates[0] + dx * i;
            var y = lastPoint.coordinates[1] + dy * i;
            skinPoint = new SkinPoint(x, y);
            skinPoint.assignNearestBone(this.bones, this.skin.points.length == 0 ? null : this.skin.points[this.skin.points.length - 1]);
            this.skin.addPoint(skinPoint);
        }
    }

    skinPoint = new SkinPoint(position[0], position[1]);
    skinPoint.assignNearestBone(this.bones, this.skin.points.length == 0 ? null : this.skin.points[this.skin.points.length - 1]);
    this.skin.addPoint(skinPoint);
    this.app.setDescription(Resources.drawSkinButton.createSkin);
};

Canvas.prototype.creatingSkeleton = function (position, ctrlKey) {
    if (!this.selectedObject) {
        this.selectedObject = new Point(position);
        this.selectedObjectType = SELECTED_OBJECT_TYPE.POINT;
        this.app.setDescription(Resources.drawSkeletonButton.createBone);
        return;
    }

    var startPoint = this.selectedObject;
    var endPoint = new Point(position);
    var bone = new Bone(startPoint, endPoint, this.selectedObject.bone);

    endPoint.bone = bone;
    this.bones.push(bone);
    if (!ctrlKey) {
        this.selectedObject = endPoint;
    }
};

Canvas.prototype.positionCollideWithAnyPoint = function (position) {
    for (var i = 0; i < this.bones.length; i++) {
        var collidedPoint = this.bones[i].positionCollide(position);
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
    this.app.setDescription(Resources.selectButton.selectNext);

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

    var bone, isConnected;
    if (this.selectedObjectType == SELECTED_OBJECT_TYPE.POINT) {
        bone = this.selectedObject.bone;
        if (bone && bone.containsPoint(selectedPoint)) {
            // we selected second point of bone
            bone.select();
            this.selectedObject = bone;
            this.selectedObjectType = SELECTED_OBJECT_TYPE.BONE;
            return;
        }

        bone = selectedPoint.bone;
        if (bone && bone.isMadeOfPoints(selectedPoint, this.selectedObject)) {
            bone.select();
            this.selectedObject = bone;
            this.selectedObjectType = SELECTED_OBJECT_TYPE.BONE;
        } else {
            defaultPointSelect(selectedPoint);
        }
        return;
    }

    if (this.selectedObjectType == SELECTED_OBJECT_TYPE.BONE) {
        this.selectedObject = [this.selectedObject];
        this.selectedObjectType = SELECTED_OBJECT_TYPE.ARRAY;
    }

    if (this.selectedObjectType == SELECTED_OBJECT_TYPE.ARRAY) {
        var length = this.selectedObject.length;
        for (var i = 0; i < length; i++) {
            var connectedBone = this.selectedObject[i].isPointConnected(selectedPoint);

            if (!connectedBone){
                bone = selectedPoint.bone;
                isConnected = bone.containsPoint(this.selectedObject[i].startPoint) || bone.containsPoint(this.selectedObject[i].endPoint);
                connectedBone = isConnected ? bone : null;
            }

            if (connectedBone) {
                connectedBone.select();
                this.selectedObject.push(connectedBone);
                return;
            }
        }
    }
    //defaultPointSelect(selectedPoint);
};

Canvas.prototype.move = function (position) {
    if (!this.selectedObject) {
        this.select(position);
        if (this.selectedObject) {
            this.savedPosition = this.selectedObject.position;
            this.app.setDescription(Resources.moveButton.move);
            this.selectedObjectType = SELECTED_OBJECT_TYPE.POINT;
        }
        return;
    }

    if (this.selectedObject) {
        var bone = this.selectedObject.bone;
        var i = 0, j = 0;
        if (bone) {
            bone.length = this.selectedObject.getDistance(bone.startPoint);
            bone.recalculateAngle(this.selectedObject);
            for (i; i < bone.children.length; i++) {
                var childBone = bone.children[i];
                childBone.setStartPoint(this.selectedObject.position);
                childBone.recalculateLength();
                childBone.recalculateAngle(bone.children[i].endPoint);

                for (j; j < childBone.children.length; j++) {
                    childBone.children[j].recalculateAngle(childBone.children[j].endPoint);
                }
            }
        } else {
            while(i < this.bones.length && this.bones[i].startPoint === this.selectedObject){
                var bone = this.bones[i];
                bone.setStartPoint(this.selectedObject.position);
                bone.recalculateLength();
                bone.recalculateAngle(bone.endPoint);
                for (var j = 0; j < bone.children.length; j++) {
                    bone.children[j].recalculateAngle(bone.children[j].endPoint);
                }
                i++;
            }
        }

        this.savedPosition = null;
        this.deselect();
        this.app.setDescription(Resources.moveButton.pickPosition);
    }
};

Canvas.prototype.forwardKinematics = function (position) {
    if (!this.selectedObject || this.selectedObjectType == SELECTED_OBJECT_TYPE.POINT) {
        this.select(position);
        if (this.selectedObjectType == SELECTED_OBJECT_TYPE.BONE) {
            this.selectedObject.cacheAngle();
            this.app.setDescription(Resources.forwardKinematicsButton.forward);
        } else {
            this.app.setDescription(Resources.forwardKinematicsButton.pickBone);
        }
        return;
    }

    if (this.selectedObject) {
        for(var i = 0; i < this.skin.points.length; i++){
            if(this.skin.points[i].isNearToJoint(this.selectedObject)){
                this.skin.points[i].cacheAngle(this.skin.points[i].relatedAngle + (this.selectedObject.cachedAngle - this.selectedObject.angle));
            } else if(this.skin.points[i].relatedAngle != 0){
                this.skin.points[i].transformCachedCoordinates();
            }
        }
        this.skin.cache(this.selectedObject);
        for(var i = 0; i < this.bones.length; i++){
            this.bones[i].resetTranformationMatrix();
        }
        this.cancelAll();
    }
};

Canvas.prototype.removeBone = function (bone) {
    for (var i = 0; i < this.bones.length; i++) {
        if (this.bones[i] == bone) {
            this.bones.splice(i, 1);
        }
    }
};

Canvas.prototype.fenceSelect = function (position) {
    if (!this.savedPosition) {
        this.deselect();
        this.savedPosition = position;
    } else {
        var selectedBones = [];
        var i;
        for (i = 0; i < this.bones.length; i++) {
            if (this.bones[i].isInRectangle(this.savedPosition, position)){
                selectedBones.push(this.bones[i]);
            }
        }
        var bones = returnBiggestComponent(selectedBones);
        for (i = 0; i < bones.length; i++) {
            bones[i].select();
        }
        selectedBones = bones;

        if (selectedBones.length == 1){
            this.selectedObjectType = SELECTED_OBJECT_TYPE.BONE;
            this.selectedObject = selectedBones[0];
        }

        if (selectedBones.length > 1){
            this.selectedObjectType = SELECTED_OBJECT_TYPE.ARRAY;
            this.selectedObject = selectedBones;
        }

        this.savedPosition = null;
    }
};

// ------------------------------ BUTTON CLICKS ------------------------------

Canvas.prototype.selectionButtonClick = function () {
    if (this.state != CANVAS_STATES.FENCE_SELECTION) {
        this.cancelAll();
    }
    this.app.setDescription(Resources.selectButton.select);
    if (this.selectedObject){
        this.app.setDescription(Resources.selectButton.selectNext);
    }

    this.state = CANVAS_STATES.SELECTION;
};

Canvas.prototype.fenceSelectionButtonClick = function () {
    this.cancelAll();
    this.state = CANVAS_STATES.FENCE_SELECTION;
    this.app.setDescription(Resources.fenceSelectButton.select);
};

Canvas.prototype.drawSkeletonButtonClick = function () {
    var selectedObject = this.selectedObject;
    var selectedObjectType = this.selectedObjectType;
    this.cancelAll();
    this.app.setDescription(Resources.drawSkeletonButton.pickPosition);
    if (selectedObjectType == SELECTED_OBJECT_TYPE.POINT) {
        this.selectedObject = selectedObject;
        this.app.setDescription(Resources.drawSkeletonButton.createBone);
    }
    this.state = CANVAS_STATES.CREATING_SKELETON;
};

Canvas.prototype.moveButtonClick = function () {
    var selectedPoint = this.selectedObject;
    var selectedObjectType = this.selectedObjectType;
    this.cancelAll();
    this.app.setDescription(Resources.moveButton.pickPosition);
    if (selectedObjectType == SELECTED_OBJECT_TYPE.POINT) {
        this.app.setDescription(Resources.moveButton.move);
        this.selectedObject = selectedPoint;
        this.savedPosition = selectedPoint.position;
        this.selectedObjectType = SELECTED_OBJECT_TYPE.POINT;
        selectedPoint.select();
    }
    this.state = CANVAS_STATES.MOVE;
};

// TODO tieto hlupe kontroly na instance tu nemusia byt, staci disablovat toto tlacitko podla selectu, napr dame classy
// ze ake selecty podporuje
Canvas.prototype.removeBoneButtonClick = function () {
    if (!this.selectedObject) {
        return;
    }

    if (this.selectedObjectType == SELECTED_OBJECT_TYPE.POINT) {
        return;
    }

    var self = this;

    function removeBone(bone) {
        var parent = bone.parent;
        var children = bone.children;
        var i;
        if (!parent && children.length > 0) {
            for (i = 0; i < children.length; i++) {
                children[i].parent = null;
                children[i].recalculateAngle(children[i].endPoint);
            }
            self.removeBone(bone);

        } else if (parent) {
            for (i = 0; i < children.length; i++) {
                parent.children.push(children[i]);
                children[i].parent = parent;
                children[i].startPoint = parent.endPoint;
                children[i].recalculateLength();
                children[i].recalculateAngle(children[i].endPoint);
                for (var j = 0; j < children[i].children.length; j++) {
                    children[i].children[j].recalculateAngle(children[i].children[j].endPoint);
                }
            }
            parent.removeChild(bone);
            self.removeBone(bone);

        } else if (!parent && children.length == 0) {
            self.removeBone(bone);
        }
    }

    if (this.selectedObjectType == SELECTED_OBJECT_TYPE.BONE) {
        removeBone(this.selectedObject);

    } else if (this.selectedObjectType == SELECTED_OBJECT_TYPE.ARRAY) {
        for (var i = 0; i < this.selectedObject.length; i++) {
            removeBone(this.selectedObject[i]);
        }
    }

    this.deselect();
    this.state = CANVAS_STATES.IDLE;
    this.app.setDescription(Resources.default);
};

Canvas.prototype.removeSkinButtonClick = function () {
    this.skin = new Skin();
    this.deselect();
    this.state = CANVAS_STATES.IDLE;
    this.app.setDescription(Resources.default);
};

Canvas.prototype.forwardKinematicsButtonClick = function () {
    if (this.selectedObjectType != SELECTED_OBJECT_TYPE.BONE && this.selectedObjectType != SELECTED_OBJECT_TYPE.POINT) {
        this.cancelAll();
    }
    if (this.selectedObjectType == SELECTED_OBJECT_TYPE.BONE) {
        this.selectedObject.cacheAngle();
    }

    this.app.setDescription(Resources.forwardKinematicsButton.pickBone);
    if (this.selectedObjectType == SELECTED_OBJECT_TYPE.BONE) {
        this.app.setDescription(Resources.forwardKinematicsButton.forward);
    }
    this.state = CANVAS_STATES.FORWARD_KINEMATICS;
};

Canvas.prototype.drawSkinButtonClick = function () {
    this.cancelAll();
    this.state = CANVAS_STATES.DRAW_SKIN;
    if (this.skin.points.length == 0){
        this.app.setDescription(Resources.drawSkinButton.pickPosition);
    } else {
        this.app.setDescription(Resources.drawSkinButton.createSkin);
    }

};
