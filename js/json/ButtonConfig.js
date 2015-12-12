var ButtonConfig = {
    resetButton: {},
    selectButton: {},
    fenceSelectButton: {},
    openHelp: {},
    closeHelp: {},

    drawSkeletonButton: {
        canBeDisabled: true,
        enabledWhen: {
            selectedNONE: true,
            selectedPOINT: true
        }
    },

    removeSkinButton: {
        canBeDisabled: true,
        enabledWhen: {
            any: true
        }
    },

    drawSkinButton: {
        canBeDisabled: true,
        enabledWhen: {
            any: true
        }
    },

    moveButton: {
        canBeDisabled: true,
        enabledWhen: {
            selectedNONE: true,
            selectedPOINT: true
        }
    },

    removeBoneButton: {
        canBeDisabled: true,
        enabledWhen: {
            selectedBONE: true,
            selectedARRAY: true
        }
    },

    forwardKinematicsButton: {
        canBeDisabled: true,
        enabledWhen: {
            selectedNONE: true,
            selectedPOINT: true,
            selectedBONE: true
        }
    }
};