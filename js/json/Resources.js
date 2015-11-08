var Resources = {
    default: "Select command",

    resetButton: {
        tooltip: "Reset everything!"
    },

    selectButton: {
        select: "Select point by clicking on it",
        selectNext: "Selecting connected point will select bone ",
        tooltip: "Select point and bones (sc. 's')"
    },

    fenceSelectButton: {
        select: "Select one or more bones by fencing them, chooses biggest connected component",
        tooltip: "Select multiple bones at once (sc. 'f')"
    },

    drawSkeletonButton: {
        pickPosition: "Click on canvas to choose starting point of first bone",
        createBone: "Click on canvas to create bone (hold ctrl to not jump to new point)",
        tooltip: "Draw bones, but there can be only one skeleton in the canvas (sc. 'e')"
    },

    drawSkinButton: {
        pickPosition: "Click on canvas to choose starting point",
        createSkin: "Click on canvas to create skin (hold ctrl to auto create many points in one line)",
        tooltip: "Draw skin for selected connected bones (sc. 'i')"
    },

    moveButton: {
        pickPosition: "Select point which you want to move",
        move: "Click on canvas where you want your point to be",
        tooltip: "Move point (sc. 'm')"
    },

    removeBoneButton: {
        tooltip: "Remove selected bones (sc. 'r')"
    },

    removeSkinButton: {
        tooltip: "Remove all skin points"
    },

    forwardKinematicsButton: {
        pickBone: "Select bone which you want to rotate",
        forward: "Click on canvas to stop moving skeleton",
        tooltip: "Forward kinematics (sc. 'k')"
    }
};