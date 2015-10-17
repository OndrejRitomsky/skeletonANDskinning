/**
 * Main object in the page which handles global things, is singleton
 * @constructor
 */
function Application() {

    if (typeof Application.instance === 'object') {
        return Application.instance;
    }

    Application.instance = this;

    this.controlPanel = $("#controlPanel");
    this.editorPanel = $("#editorPanel");
    this.description = $("#description");

    this.buttonsEnableConfig = {
        disable: [],
        none: [],
        point: [],
        bone: [],
        array: []
    };

    this.buttons = {};
    this.initButtons();

    this.savedDescription = Resources.default;
    this.initEnterLeaveButtonEvents();

    this.editor = null;
    this.canvas = this.initCanvas();
    this.canvas.selectedObjectType = SELECTED_OBJECT_TYPE.NONE;
}

Application.prototype.initEnterLeaveButtonEvents = function () {
    var self = this;

    function mouseEnter(tooltip) {
        self.savedDescription = self.getDescription();
        self.setDescription(tooltip);
    }

    function mouseLeave() {
        self.setDescription(self.savedDescription);
    }

    $.each(this.buttons, function(id, button) {
        var resource = Resources[id + "Button"];
        if (resource) {
            var tooltip = resource.tooltip || "";
            button.mouseenter(function () {
                mouseEnter(tooltip);
            }).mouseleave(mouseLeave);
        }
    });
};

Application.prototype.initButtons = function(){
    var selectButton = $("#select");
    var fenceSelectButton = $("#fenceSelect");
    var drawSkeletonButton = $("#drawSkeleton");
    var drawSkinButton = $("#drawSkin");
    var moveButton = $("#move");
    var removeButton = $("#remove");
    var forwardKinematicsButton = $("#forwardKinematics");

    this.buttons[selectButton[0].id] = selectButton;
    this.buttons[fenceSelectButton[0].id] = fenceSelectButton;
    this.buttons[drawSkeletonButton[0].id] = drawSkeletonButton;
    this.buttons[drawSkinButton[0].id] = drawSkinButton;
    this.buttons[moveButton[0].id] = moveButton;
    this.buttons[removeButton[0].id] = removeButton;
    this.buttons[forwardKinematicsButton[0].id] = forwardKinematicsButton;

    // TODO update drawskin button config, when skin obj is created

    // Buttons that we want to disable
    this.buttonsEnableConfig.disable.push(drawSkeletonButton[0].id);
    this.buttonsEnableConfig.disable.push(drawSkinButton[0].id);
    this.buttonsEnableConfig.disable.push(moveButton[0].id);
    this.buttonsEnableConfig.disable.push(removeButton[0].id);
    this.buttonsEnableConfig.disable.push(forwardKinematicsButton[0].id);

    // SELECTED_OBJECT_TYPE.NONE:
    this.buttonsEnableConfig.none.push(drawSkinButton[0].id);
    this.buttonsEnableConfig.none.push(drawSkeletonButton[0].id);
    this.buttonsEnableConfig.none.push(moveButton[0].id);
    this.buttonsEnableConfig.none.push(forwardKinematicsButton[0].id);

    // SELECTED_OBJECT_TYPE.POINT:
    this.buttonsEnableConfig.point.push(moveButton[0].id);
    this.buttonsEnableConfig.point.push(drawSkeletonButton[0].id);
    this.buttonsEnableConfig.point.push(forwardKinematicsButton[0].id);

    // SELECTED_OBJECT_TYPE.BONE:
    this.buttonsEnableConfig.bone.push(removeButton[0].id);
    this.buttonsEnableConfig.bone.push(forwardKinematicsButton[0].id);

    // SELECTED_OBJECT_TYPE.ARRAY:
    this.buttonsEnableConfig.array.push(removeButton[0].id);
};

Application.prototype.enabledDisableButtons = function (selectedType) {
    var self = this;
    function disabled(ids, value) {
        for (var i = 0; i < ids.length; i++) {
            self.buttons[ids[i]].prop("disabled", value);
        }
    }
    /*  if (this.canvas && this.canvas.bones.length == 0) {
     setDisabled(this.drawSkeletonButton, false);
     }*/

    disabled(this.buttonsEnableConfig.disable, true);

    switch (selectedType) {
        case SELECTED_OBJECT_TYPE.NONE:
            disabled(this.buttonsEnableConfig.none, false);
            break;
        case SELECTED_OBJECT_TYPE.POINT:
            disabled(this.buttonsEnableConfig.point, false);
            break;
        case SELECTED_OBJECT_TYPE.BONE:
            disabled(this.buttonsEnableConfig.bone, false);
            break;
        case SELECTED_OBJECT_TYPE.ARRAY:
            disabled(this.buttonsEnableConfig.array, false);
            break;
    }
};

Application.prototype.setDescription = function (text) {
    this.description.html(text);
};

Application.prototype.getDescription = function () {
    return this.description.html();
};

Application.prototype.initCanvas = function () {
    var canvas = $("#canvas")[0];
    var context = canvas.getContext("2d");
    return new Canvas(canvas, context, this);
};


Application.prototype.closeEditor = function (callback) {
    if (this.editor) {
        var self = this;
        this.editor.node.fadeOut(400, function () {
            $(this).remove();
            self.editor = null;
            if (callback) {
                callback();
            }
        });
    }
};

Application.prototype.openEditor = function (html) {
    console.log(this.editor);
    if (!this.editor) {
        this.editorPanel.append(html);
        var editor = new Editor($("#editor"));
        this.editor = editor;
        this.editor.node.fadeIn(400, function () {
            editor.node.removeAttr("style")
        });
    }
};
