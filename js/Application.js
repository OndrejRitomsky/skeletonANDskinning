$(document).ready(function () {
    new Application();
});

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
    this.description = $("#description");

    this.canvas = null;
    this.initCanvas();

    this.initKeyPress();

    this.buttons = {};
    this.initButtons();

    this.activeButton = null;
    this.stateButtonClicked = false;
    this.savedDescription = Resources.default;
    this.initEnterLeaveButtonEvents();

    // must be here, when configs are loaded so we can disable buttons which cant be use in the start
    this.canvas.selectedObjectType = SELECTED_OBJECT_TYPE.NONE;
}

Application.prototype.initEnterLeaveButtonEvents = function () {
    var self = this;

    function mouseEnter(tooltip) {
        self.savedDescription = self.getDescription();
        self.setDescription(tooltip);
    }

    function mouseLeave() {
        if (!self.stateButtonClicked) {
            self.setDescription(self.savedDescription);
        }
        self.stateButtonClicked = false;
    }

    $.each(this.buttons, function (id, button) {
        var resource = Resources[id + "Button"];
        if (resource) {
            var tooltip = resource.tooltip || "";
            button.mouseenter(function () {
                mouseEnter(tooltip);
            }).mouseleave(mouseLeave);
        }
    });
};

Application.prototype.initButtons = function () {
    var self = this;

    function appButtonClick(button, isStateButton) {
        if (self.activeButton) {
            self.activeButton.parents('.btnContainer').removeClass("active");
        }
        if (isStateButton) {
            self.stateButtonClicked = true;
            button.parents('.btnContainer').addClass("active");
            self.activeButton = button;
        }
    }

    var resetButton = $("#reset");
    resetButton.click(function () {
        self.canvas.resetAll();
        appButtonClick(resetButton, false);
        self.stateButtonClicked = true;
    });
    this.buttons[resetButton[0].id] = resetButton;

    var selectButton = $("#select");
    selectButton.click(function () {
        self.canvas.selectionButtonClick();
        appButtonClick(selectButton, true);
    });
    this.buttons[selectButton[0].id] = selectButton;

    var fenceSelectButton = $("#fenceSelect");
    fenceSelectButton.click(function () {
        self.canvas.fenceSelectionButtonClick();
        appButtonClick(fenceSelectButton, true);
    });
    this.buttons[fenceSelectButton[0].id] = fenceSelectButton;

    var drawSkeletonButton = $("#drawSkeleton");
    drawSkeletonButton.click(function () {
        self.canvas.drawSkeletonButtonClick();
        appButtonClick(drawSkeletonButton, true);
    });
    this.buttons[drawSkeletonButton[0].id] = drawSkeletonButton;

    var drawSkinButton = $("#drawSkin");
    drawSkinButton.click(function () {
        self.canvas.drawSkinButtonClick();
        appButtonClick(drawSkinButton, true);
    });
    this.buttons[drawSkinButton[0].id] = drawSkinButton;

    var moveButton = $("#move");
    moveButton.click(function () {
        self.canvas.moveButtonClick();
        appButtonClick(moveButton, true);
    });
    this.buttons[moveButton[0].id] = moveButton;

    var removeBoneButton = $("#removeBone");
    removeBoneButton.click(function () {
        self.canvas.removeBoneButtonClick();
        appButtonClick(removeBoneButton, false);
    });
    this.buttons[removeBoneButton[0].id] = removeBoneButton;

    var removeSkinButton = $("#removeSkin");
    removeSkinButton.click(function () {
        self.canvas.removeSkinButtonClick();
        appButtonClick(removeSkinButton, false);
    });
    this.buttons[removeSkinButton[0].id] = removeSkinButton;

    var forwardKinematicsButton = $("#forwardKinematics");
    forwardKinematicsButton.click(function () {
        self.canvas.forwardKinematicsButtonClick();
        appButtonClick(forwardKinematicsButton, true);
    });
    this.buttons[forwardKinematicsButton[0].id] = forwardKinematicsButton;

    // TODO update drawskin button config, when skin obj is created
};

Application.prototype.enabledDisableButtons = function (selectedTypeName) {
    // disable button based on button config.canBeDisabled
    var id;
    for (id in this.buttons) {
        var config = ButtonConfig[id + "Button"];
        if (config) {
            var disable = config["canBeDisabled"];
            if (disable) {
                this.buttons[id].prop("disabled", "disabled");
            }
        }
    }

    // enable button based on buttonConfig.selectedType
    for (id in this.buttons) {
        var button = this.buttons[id];
        var config = ButtonConfig[id + "Button"];
        if (config && config.enabledWhen) {
            var enable = config.enabledWhen["selected" + selectedTypeName] || config.enabledWhen["any"];
            if (enable) {
                button.prop("disabled", false);
            }
        }
    }

    // special cases which cant be decided by selected points only
    if (this.canvas.bones.length > 0 && selectedTypeName != "POINT") {
        this.buttons["drawSkeleton"].prop("disabled", "disabled");
    }

    if (this.canvas.bones.length == 0) {
        this.buttons["drawSkin"].prop("disabled", "disabled");
        this.buttons["removeSkin"].prop("disabled", "disabled");
    }

    if (this.canvas.skin.points.length == 0) {
        this.buttons["removeSkin"].prop("disabled", "disabled");
    } else {
        this.buttons["move"].prop("disabled", "disabled");
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
    this.canvas = new Canvas(canvas, context, this);
};

Application.prototype.initKeyPress = function () {
    var self = this;

    $(document).keydown(function (e) {
        var button = null;
        switch (e.which) {
            // "s"
            case 83:
                button = self.buttons["select"];
                break;
            // "f"
            case 70:
                button = self.buttons["fenceSelect"];
                break;
            // "e"
            case 69:
                button = self.buttons["drawSkeleton"];
                break;
            // "i"
            case 73:
                button = self.buttons["drawSkin"];
                break;
            // "m"
            case 77:
                button = self.buttons["move"];
                break;
            // "r"
            case 82:
                button = self.buttons["remove"];
                break;
            // "k"
            case 75:
                button = self.buttons["forwardKinematics"];
                break;
        }
        if (button) {
            if (!button.prop("disabled")) {
                button.trigger("click");
            }
        }
    });
};

