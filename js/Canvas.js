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
    this.state = CANVAS_STATES.IDLE;
    this.mousePos = {x: 0, y: 0};

    var self = this;
    this.canvas.addEventListener("mousemove", function (ev) {
        self.onMouseMove(ev);
    });

    this.canvas.addEventListener("mouseup", function (ev) {
        console.log("click");
        self.onClick(ev);
    });

    this.canvas.oncontextmenu = function (ev) {
        ev.preventDefault();
    };

    this.resetAll();
    this.frame();

    this.selectedObject = null;

    var selectedObjectType;
    Object.defineProperty(this, "selectedObjectType", {
        set: function (value) {
            selectedObjectType = value;
            self.app.enabledDisableButtons(value);
        },
        get: function(){
            return selectedObjectType;
        }
    });
    this.savedPosition = null;
    this.skin = [];
    this.app.setDescription(Resources.default);
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
        case CANVAS_STATES.SELECTION:
            this.select(point);
            break;

        case CANVAS_STATES.FENCE_SELECTION:
            this.fenceSelect(point);
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

        case CANVAS_STATES.DRAW_SKIN:
            this.createSkin(point);
            break;
    }
};

Canvas.prototype.cancelAll = function () {
    if (this.savedPosition && this.state == CANVAS_STATES.MOVE) {
        this.selectedObject.x = this.savedPosition.x;
        this.selectedObject.y = this.savedPosition.y;
    }
    this.savedPosition = null;
    this.resetState();
    this.deselect();
    this.app.setDescription(Resources.default);
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

Canvas.prototype.clearCanvas = function (color) {
    this.context.fillStyle = color || BACKGROUND_COLOR;
    this.context.fillRect(0, 0, this.width, this.height);
};

Canvas.prototype.resetAll = function () {
    this.bones = [];
    this.skin = [];
    this.deselect();
    this.clearCanvas();
    this.resizeToWindow();
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
        this.selectedObject.x = this.mousePos.x;
        this.selectedObject.y = this.mousePos.y;
    }

    if (this.state == CANVAS_STATES.FORWARD_KINEMATICS && this.selectedObjectType == SELECTED_OBJECT_TYPE.BONE) {
        var bone = this.selectedObject;
        var endPoint = this.selectedObject.getEndPoint();
        var angle = bone.startPoint.radiansTo(new Point(this.mousePos.x, this.mousePos.y));
        endPoint.x = bone.startPoint.x + Math.cos(angle) * bone.length;
        endPoint.y = bone.startPoint.y + Math.sin(angle) * bone.length;

        bone.setHighlightAll(true);
        var degInRad;
        if (bone.parent) {
            degInRad = bone.startPoint.radians2To(bone.parent.startPoint, endPoint);
            bone.setAngle(degInRad);
        } else {
            degInRad = bone.startPoint.radiansTo(endPoint);
            bone.setAngle(degInRad);
        }
    }
};

Canvas.prototype.draw = function () {
    for (var i = 0; i < this.bones.length; i++) {
        this.bones[i].draw(this.context);
    }

    for (var i = 1; i < this.skin.length; i++) {
        var pos = this.skin[i - 1];
        var pos2 = this.skin[i];
        var position1 = {x: pos[0], y: pos[1]};
        var position2 = {x: pos2[0], y: pos2[1]};
        var w = 1;
        drawLine(this.context, position1, position2, DEFAULT_COLOR, 1);
    }
    if (this.state != CANVAS_STATES.DRAW_SKIN && this.skin.length > 2) {
        var pos = this.skin[this.skin.length - 1];
        var pos2 = this.skin[0];
        var position1 = {x: pos[0], y: pos[1]};
        var position2 = {x: pos2[0], y: pos2[1]};
        drawLine(this.context, position1, position2, DEFAULT_COLOR, 1);
    }

    if (this.state == CANVAS_STATES.CREATING_SKELETON && this.selectedObject) {
        var position1 = {x: this.selectedObject.x, y: this.selectedObject.y};
        drawDiskPart(this.context, position1, Point.prototype.RADIUS, SELECTED_COLOR, 0, 2 * Math.PI);
        drawLine(this.context, position1, this.mousePos, SELECTED_COLOR, Bone.prototype.LINE_WIDTH);
        drawDiskPart(this.context, this.mousePos, Point.prototype.RADIUS, SELECTED_COLOR, 0, 2 * Math.PI);

    } else if (this.state == CANVAS_STATES.CREATING_SKELETON && !this.selectedObject) {
        drawDiskPart(this.context, this.mousePos, Point.prototype.RADIUS, SELECTED_COLOR, 0, 2 * Math.PI);
    }

    if (this.state == CANVAS_STATES.FORWARD_KINEMATICS && this.selectedObjectType == SELECTED_OBJECT_TYPE.BONE) {
        this.selectedObject.setHighlightAll(false);
    }

    if (this.state == CANVAS_STATES.FENCE_SELECTION && this.savedPosition) {
        var width = this.mousePos.x - this.savedPosition.x;
        var height = this.mousePos.y - this.savedPosition.y;
        drawRect(this.context, this.savedPosition, width, height, FENCE_COLOR);
    }
};

Canvas.prototype.createSkin = function (point){
    this.skin.push([point.x,point.y,1]);
    this.app.setDescription(Resources.drawSkinButton.createSkin);
};

Canvas.prototype.creatingSkeleton = function (point, ctrlKey) {
    if (!this.selectedObject) {
        this.selectedObject = new Point(point.x, point.y);
        this.selectedObjectType = SELECTED_OBJECT_TYPE.POINT;
        this.app.setDescription(Resources.drawSkeletonButton.createBone);
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
        var length = this.selectedObject.length;
        for (var i = 0; i < length; i++) {
            connectedBone = this.selectedObject[i].isPointConnected(selectedPoint);
            if (connectedBone) {
                connectedBone.select();
                this.selectedObject.push(connectedBone);
            }
        }
    }
};


Canvas.prototype.move = function (point) {
    if (!this.selectedObject) {
        this.select(point);
        if (this.selectedObject) {
            this.savedPosition = {x: this.selectedObject.x, y: this.selectedObject.y};
            this.app.setDescription(Resources.moveButton.move);
        }
        return;
    }

    if (this.selectedObject) {
        var bone = this.selectedObject.bone;

        if(bone) {
            if (!bone.children[0]) {
                bone.length = this.selectedObject.getDistance(bone.startPoint);
                bone.recalculateAngle(this.selectedObject);
            } else {
                bone.length = this.selectedObject.getDistance(bone.startPoint);
                bone.recalculateAngle(this.selectedObject);
                for (var i = 0; i < bone.children.length; i++) {
                    bone.children[i].setStartPoint(this.selectedObject);
                    bone.children[i].recalculateLength();
                    bone.children[i].recalculateAngle(bone.children[i].endPoint);
                    for (var j = 0; j < bone.children[i].children.length; j++) {
                        bone.children[i].children[j].recalculateAngle(bone.children[i].children[j].endPoint);
                    }
                }
            }
        } else {
            var iter = 0;
            while(this.bones[iter].startPoint === this.selectedObject){
                this.bones[iter].setStartPoint(this.selectedObject);
                this.bones[iter].recalculateLength();
                this.bones[iter].recalculateAngle(this.bones[iter].endPoint);
                for (var j = 0; j < this.bones[iter].children.length; j++) {
                    this.bones[iter].children[j].recalculateAngle(this.bones[iter].children[j].endPoint);
                }
                iter++;
            }
        }

        this.savedPosition = null;
        this.selectedObjectType = SELECTED_OBJECT_TYPE.POINT;
        this.deselect();
    }
};

Canvas.prototype.forwardKinematics = function (point) {
    if (!this.selectedObject || this.selectedObjectType == SELECTED_OBJECT_TYPE.POINT) {
        this.select(point);
        if (this.selectedObjectType == SELECTED_OBJECT_TYPE.BONE) {
            this.app.setDescription(Resources.forwardKinematicsButton.forward);
        } else {
            this.app.setDescription(Resources.forwardKinematicsButton.pickBone);
        }
        return;
    }

    if (this.selectedObject) {
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

// will be used with skin for disabling skinning not connected bones
Canvas.prototype.areSelectedBonesConntected = function(){
    if (this.selectedObjectType != SELECTED_OBJECT_TYPE.ARRAY){
        return true;
    }

    var booleans = [true];
    for (var i = 1; i < this.selectedObject.length; i++){
        booleans.push(false);
    }
    for (i = 1; i < this.selectedObject.length; i++) {

        if (!isBoneConnectedToBone2TroughBones(this.selectedObject[0], this.selectedObject[i], this.selectedObject, booleans)){
            return false;
        }

        for (var j = 1; j < booleans.length; j++){
            booleans[j] = false;
        }
    }
    return true;
};

Canvas.prototype.fenceSelect = function (point) {
    if (!this.savedPosition) {
        this.deselect();
        this.savedPosition = point;
    } else {
        var selectedBones = [];
        for (var i = 0; i < this.bones.length; i++) {
            if (this.bones[i].isInRectangle(this.savedPosition, point)){
                selectedBones.push(this.bones[i]);
                //this.bones[i].select();
            }
        }
        var x = this.returnBiggestComponent(selectedBones);
        for (var i = 0; i < x.length; i++) {
            x[i].select();
        }
        selectedBones = x;

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
    this.cancelAll();
    this.app.setDescription(Resources.drawSkeletonButton.pickPosition);
    if (selectedObject) {
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
        selectedPoint.select();
        this.app.setDescription("You can move joint, choose position and left click to finish or right click to cancel command.");
    }
    this.state = CANVAS_STATES.MOVE;
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
            for (i = 0; i < children.length; i++) {
                children[i].parent = null;
                children[i].recalculateAngle(children[i].endPoint);
            }
            self.removeBone(bone);

        } else if (parent) {
            parent.removeChild(bone);
            parent.endPoint = bone.endPoint;
            parent.endPoint.bone = parent;
            parent.recalculateLength();
            parent.recalculateAngle(parent.endPoint);
            for (i = 0; i < children.length; i++) {
                parent.children.push(children[i]);
                children[i].parent = parent;
                children[i].startPoint = parent.getEndPoint();
                children[i].recalculateAngle(children[i].endPoint);  //  A   C   blesk  D   C
                for(var j = 0; j < children[i].children.length; j++){
                    children[i].children[j].recalculateAngle(children[i].children[j].endPoint);
                }
            }
            self.removeBone(bone);

        } else if (!parent && children.length == 0) {
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

Canvas.prototype.forwardKinematicsButtonClick = function () {
    var selectedObject = this.selectedObject;
    var selectedObjectType = this.selectedObjectType;
    this.cancelAll();
    this.app.setDescription(Resources.forwardKinematicsButton.pickBone);
    if (selectedObjectType == SELECTED_OBJECT_TYPE.BONE) {
        this.app.setDescription(Resources.forwardKinematicsButton.forward);
        this.selectedObject = selectedObject;
        this.selectedObjectType = selectedObjectType;
    }
    this.state = CANVAS_STATES.FORWARD_KINEMATICS;
};

Canvas.prototype.drawSkinButtonClick = function () {
    this.cancelAll();
    this.state = CANVAS_STATES.DRAW_SKIN;
    this.app.setDescription(Resources.drawSkinButton.pickPosition);
};

Canvas.prototype.returnBiggestComponent = function (listOfBones) {
    var actual = new HashSet();
    var tmpRes = new HashSet();
    actual.fill(listOfBones);
    var keyArray = actual.keyArray();
    var res = [];
    //BFS
    while (!actual.isEmpty()){
        var queue = [];
        tmpRes.clear();
        queue.push(keyArray[0]);
        actual.remove(keyArray[0]);
        while(queue[0]){
            //look at all child and ask if they are in set
            for(var i = 0; i < queue[0].children.length; i++){
                if(actual.contains(queue[0].children[i]) && !tmpRes.contains(queue[0].children[i])){
                    queue.push(queue[0].children[i]);
                    actual.remove(queue[0].children[i]);
                }
            }
            //also look at parent and ask if it is in set
            if(queue[0].parent && actual.contains(queue[0].parent)){
                queue.push(queue[0].parent);
                actual.remove(queue[0].parent);
            }
            //remove first element from queue;
            tmpRes.add(queue.shift());
        }
        //actualize key array
        keyArray = actual.keyArray();
        var tmpResArray = tmpRes.keyArray();
        if(res.length < tmpResArray.length){
            res = tmpResArray.slice();
        }
    }
    return res;
};





