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

    this.canvas = this.initCanvas();
    this.editor = null;
}

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
