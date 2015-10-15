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

    // try to create nice config for these and selecttype -> disabled enabled
    //this.clearButton = $("#select");
    //
    //this.fenceSelectButton = $("#fenceSelect");
    this.drawSkeletonButton = $("#drawSkeleton");
    this.moveButton = $("#move");
    this.destroyButton = $("#destroy");
    this.forwardKinematicsButton = $("#forwardKinematics");
    this.editor = null;
    this.canvas = this.initCanvas();
}

Application.prototype.enabledDisableButtons = function (selectedType) {
    function setDisabled(selector, value) {
        selector.prop("disabled", value);
    }

    setDisabled(this.drawSkeletonButton, true);
    setDisabled(this.moveButton, true);
    setDisabled(this.destroyButton, true);
    setDisabled(this.forwardKinematicsButton, true);

    switch (selectedType) {
        case SELECTED_OBJECT_TYPE.NONE:
            setDisabled(this.moveButton, false);
            if (!this.canvas || this.canvas.bones.length == 0) {
                setDisabled(this.drawSkeletonButton, false);
            }
            setDisabled(this.forwardKinematicsButton, false);
            break;

        case SELECTED_OBJECT_TYPE.POINT:
            setDisabled(this.moveButton, false);
            setDisabled(this.drawSkeletonButton, false);
            break;

        case SELECTED_OBJECT_TYPE.BONE:
            setDisabled(this.destroyButton, false);
            setDisabled(this.forwardKinematicsButton, false);
            break;

        case SELECTED_OBJECT_TYPE.ARRAY:
            setDisabled(this.destroyButton, false);
            break;

    }
};

Application.prototype.setDescription = function (text) {
    this.description.html(text);
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
