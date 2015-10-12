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
    $("#open").on("click", function () {
        var html = "<div id='editor' style='display: none'><h4>editor</h4><br><input type='text' value='placeholder'><br><input type='text' value='placeholder'><br>" +
            "<input type='text' value='placeholder'><br><input type='text' value='placeholder'><br></div>";

        app.openEditor(html);
    });

    $("#close").click(function () {
        app.closeEditor();
    });


    // create resources for strings!!
    $("#drawSkeleton").click(function () {
        canvas.drawSkeletonButtonClick.call(canvas);
        app.setDescription("You can draw skeleton with left click.");
    });

    // treba tu call, asi ne
    $("#move").click(function () {
        canvas.moveButtonClick.call(canvas);
        app.setDescription("You can move joint, start by selecting one.");
    });

    $("#forwardKinematics").click(function () {
        canvas.forwardKinematicsButtonClick.call(canvas);
        app.setDescription("Forward blabla");
    });

    app.setDescription("Use left click to select joint, which is useless");

});
