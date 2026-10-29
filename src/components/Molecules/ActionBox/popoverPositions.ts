import { PopperPlacementType } from '@mui/material';

//Map created based on https://v8.mui.com/material-ui/react-popover/
export function determinePopoverPositions(placement: PopperPlacementType | undefined): object {
    switch (placement) {
        case 'bottom-end':
            return {
                anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'right',
                },
                transformOrigin: {
                    vertical: 'top',
                    horizontal: 'right',
                },
            };
        case 'bottom-start':
            return {
                anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'left',
                },
                transformOrigin: {
                    vertical: 'top',
                    horizontal: 'left',
                },
            };
        case 'top-end':
            return {
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'right',
                },
                transformOrigin: {
                    vertical: 'bottom',
                    horizontal: 'right',
                },
            };
        case 'top-start':
            return {
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'left',
                },
                transformOrigin: {
                    vertical: 'bottom',
                    horizontal: 'left',
                },
            };
        case 'left-end':
            return {
                anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'left',
                },
                transformOrigin: {
                    vertical: 'bottom',
                    horizontal: 'right',
                },
            };
        case 'left-start':
            return {
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'left',
                },
                transformOrigin: {
                    vertical: 'top',
                    horizontal: 'right',
                },
            };
        case 'right-end':
            return {
                anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'right',
                },
                transformOrigin: {
                    vertical: 'bottom',
                    horizontal: 'left',
                },
            };
        case 'right-start':
            return {
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'right',
                },
                transformOrigin: {
                    vertical: 'top',
                    horizontal: 'left',
                },
            };
        case 'auto':
        case 'auto-end':
        case 'auto-start':
            return {};
        case 'right':
            return {
                anchorOrigin: {
                    vertical: 'center',
                    horizontal: 'right',
                },
                transformOrigin: {
                    vertical: 'center',
                    horizontal: 'left',
                },
            };
        case 'bottom':
            return {
                anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'center',
                },
                transformOrigin: {
                    vertical: 'top',
                    horizontal: 'center',
                },
            };
        case 'left':
            return {
                anchorOrigin: {
                    vertical: 'center',
                    horizontal: 'left',
                },
                transformOrigin: {
                    vertical: 'center',
                    horizontal: 'right',
                },
            };
        case 'top':
            return {
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'center',
                },
                transformOrigin: {
                    vertical: 'bottom',
                    horizontal: 'center',
                },
            };
        default:
            // Default case: bottom-right
            return {
                anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'right',
                },
                transformOrigin: {
                    vertical: 'top',
                    horizontal: 'right',
                },
            };
    }
}
