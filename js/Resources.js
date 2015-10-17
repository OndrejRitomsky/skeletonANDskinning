var Resources = {
    default: "Select command",

    selectButton: {
        select: "Select point by clicking on it",
        selectNext: "Selecting connected point will select bone ",
        tooltip: "Select point and bones (sc. 's')"
    },

    fenceSelectButton: {
        select: "Select one or more bones by creating selecting rectangle around them",
        tooltip: "Select multiple bones at once (sc. 'f')"
    },

    drawSkeletonButton: {
        pickPosition: "Click on canvas to choose starting point of first bone",
        createBone: "Click on canvas to create bone (hold ctrl to not jump to new point)",
        tooltip: "Draw bones, but there can be only one skeleton in the canvas(sc. 'e')"
    },

    drawSkinButton: {
        pickPosition: "Click on canvas to choose starting point",
        createSkin: "Click on canvas to create skin, canceling command after 2 parts were created will close polyline",
        tooltip: "Draw skin for selected connected bones (sc. 'i')"
    },

    moveButton: {
        pickPosition: "Select point which you want to move",
        move: "Click on canvas where you want your point to be",
        tooltip: "Move point (sc. 'm')"
    },

    removeButton: {
        tooltip: "Remove selected bones (sc. 'r')"
    },

    forwardKinematicsButton: {
        pickBone: "Select bone which you want to rotate",
        forward: "Click on canvas to stop moving skeleton",
        tooltip: "Forward kinematics (sc. 'k')"
    }
};