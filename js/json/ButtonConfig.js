var ButtonConfig = {
    resetButton: {},
    selectButton: {},
    fenceSelectButton: {},

    drawSkeletonButton: {
        canBeDisabled: true,
        enabledWhen: {
            selectedNONE: true,
            selectedPOINT: true
        }
    },

    drawSkinButton: {
        canBeDisabled: true,
        enabledWhen: {
            selectedNONE: true
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