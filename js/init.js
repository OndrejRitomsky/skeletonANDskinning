/** setup everything after page is loaded */
$(function () {

    var app = new Application();
    var canvas = app.canvas;

    window.addEventListener("resize",
        function () {
            canvas.resizeToWindow.call(canvas);
        }
        , false);

    // tmp
    /*$("#open").on("click", function () {
        var html = "<div id='editor' style='display: none'><h4>editor</h4><br><input type='text' value='placeholder'><br><input type='text' value='placeholder'><br>" +
            "<input type='text' value='placeholder'><br><input type='text' value='placeholder'><br></div>";

        app.openEditor(html);
    });

    $("#close").click(function () {
        app.closeEditor();
    });*/
    $("#clear").click(function () {
        canvas.resetAll();
    });

    $("#select").click(function () {
        canvas.selectionButtonClick();
    });

    $("#fenceSelect").click(function () {
        canvas.fenceSelectionButtonClick();
    });

    $("#drawSkeleton").click(function () {
        canvas.drawSkeletonButtonClick();
    });

    $("#drawSkin").click(function () {
        canvas.drawSkinButtonClick();
    });

    // treba tu call, asi ne
    $("#move").click(function () {
        canvas.moveButtonClick();
    });

    $("#remove").click(function () {
        canvas.destroyButtonClick();
    });

    $("#forwardKinematics").click(function () {
        canvas.forwardKinematicsButtonClick();
    });


    $(document).keydown(function(e){
        switch(e.which) {
            // "s"
            case 83:
                canvas.selectionButtonClick();
                break;
            // "f"
            case 70:
                canvas.fenceSelectionButtonClick();
                break;
            // "e"
            case 69:
                canvas.drawSkeletonButtonClick();
                break;
            // "i"
            case 73:
                canvas.drawSkinButtonClick();
                break;
            // "m"
            case 77:
                canvas.moveButtonClick();
                break;
            // "r"
            case 82:
                canvas.destroyButtonClick();
                break;
            // "k"
            case 75:
                canvas.forwardKinematicsButtonClick();
                break;
        }
    });
});
