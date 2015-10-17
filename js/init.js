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

    $("body").on("keypress", function(e){
        switch(e.key){
            case "s":
                canvas.selectionButtonClick();
                break;

            case "f":
                canvas.fenceSelectionButtonClick();
                break;

            case "e":
                canvas.drawSkeletonButtonClick();
                break;

            case "i":
                canvas.drawSkinButtonClick();
                break;

            case "m":
                canvas.moveButtonClick();
                break;

            case "r":
                canvas.destroyButtonClick();
                break;

            case "k":
                canvas.forwardKinematicsButtonClick();
                break;
        }
    } );

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
        app.setDescription("You can draw skeleton with left click.");
    });

    $("#drawSkin").click(function () {
        canvas.drawSkinButtonClick();
    });

    // treba tu call, asi ne
    $("#move").click(function () {
        canvas.moveButtonClick();
        app.setDescription("You can move joint, start by selecting one.");
    });

    $("#destroy").click(function () {
        canvas.destroyButtonClick();
    });

    $("#forwardKinematics").click(function () {
        canvas.forwardKinematicsButtonClick();
        app.setDescription("Forward blabla");
    });

    app.setDescription("Start by creating skeleton");

});
