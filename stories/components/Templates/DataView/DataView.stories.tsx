import type { Meta } from '@storybook/react-vite';
import { DataView } from '../../../../src/index.js';
import { DefaultDataViewArgs } from './common/defaultArgs.js';
import DataViewMDX from './DataView.mdx';

import { Default } from './stories/Default.js';
import { WithBottomBarSelection } from './stories/WithBottomBarSelection.js';
import { WithSelectionMode } from './stories/WithSelectionMode.js';
import { WithDynamicWidthFilter } from './stories/WithDynamicWidthFilter.js';
import { WithoutDetailAndFilter } from './stories/WithoutDetailAndFilter.js';
import { WithMultimediaGrid } from './stories/WithMultimediaGrid.js';

const meta = {
    component: DataView,
    parameters: {
        docs: {
            page: DataViewMDX,
        },
    },
    args: {
        ...DefaultDataViewArgs,
    },
    argTypes: {
        // Core functionality props
        slots: {
            control: 'object',
            description:
                'Allows composing the DataView layout with custom components. Required slot is main, which is meant for DataGrid or MultimediaGrid.' +
                ' Left, right, and bottom slots are optional. ' +
                'Top slot can be used to override the default SearchBar component.',
            table: {
                category: 'customization',
                type: {
                    summary:
                        '{ main: React.JSX.Element; left?: React.JSX.Element; ' +
                        'right?: React.JSX.Element; bottom?: React.JSX.Element; top?: React.JSX.Element; }',
                },
            },
        },
        slotProps: {
            control: 'object',
            description:
                'Allows passing props to the slot components. Top slot accepts children, menuActions and openSlotsOnMobileLabels. ' +
                'Bottom slot accepts BottomBarSlotProps.',
            table: {
                category: 'customization',
                type: {
                    summary:
                        '{ top?: { children?: React.JSX.Element[]; menuActions?: Action[]; ' +
                        'openSlotsOnMobileLabels?: { leftSlot?: string; rightSlot?: string; }; }; bottom?: BottomBarSlotProps; }',
                },
            },
        },
        rightSlotOpen: {
            control: 'boolean',
            type: 'boolean',
            description: 'State indicating whether the right slot component is open.',
            table: {
                type: { summary: 'boolean' },
                category: 'right',
            },
        },
        setRightSlotOpen: {
            type: 'function',
            description: 'Callback function to set the rightSlotOpen state.',
            table: {
                type: { summary: '(open: boolean) => void' },
                category: 'right',
            },
            action: 'setRightSlotOpen',
        },
        isMobileRightSlotOpen: {
            control: 'boolean',
            type: 'boolean',
            description:
                'Whether the mobile right slot drawer is open. Optional - if not provided, state is managed internally.',
            table: {
                type: { summary: 'boolean' },
                category: 'right',
            },
        },
        onMobileRightSlotOpen: {
            type: 'function',
            description:
                'Callback when mobile right slot drawer open state changes. Use with isMobileRightSlotOpen for controlled mode.',
            table: {
                type: { summary: '(open: boolean) => void' },
                category: 'right',
            },
            action: 'onMobileRightSlotOpen',
        },
        leftSlotOpen: {
            control: 'boolean',
            type: 'boolean',
            description: 'State indicating whether the left slot component is open.',
            table: {
                type: { summary: 'boolean' },
                category: 'left',
            },
        },
        setLeftSlotOpen: {
            type: 'function',
            description: 'Callback function to set the leftSlotOpen state.',
            table: {
                type: { summary: '(open: boolean) => void' },
                category: 'left',
            },
            action: 'setLeftSlotOpen',
        },

        leftSlotWidth: {
            control: { type: 'range', min: 150, max: 500, step: 10 },
            description:
                'Width of the left slot component. If left slot dynamic width is enabled, it will be read from localStorage.',
            table: {
                defaultValue: { summary: '220' },
                type: { summary: 'number' },
                category: 'left',
            },
        },
        leftSlotDynamicWidth: {
            control: 'object',
            description: 'Configurations for dynamic left slot width. By default it is disabled.',
            table: {
                type: {
                    summary:
                        '{ enabled?: boolean; minWidth?: number; maxWidth?: number; onChange?: (width: number) => void; }',
                },
                category: 'left',
            },
        },
        showLeftSlotToggleButton: {
            control: 'boolean',
            type: 'boolean',
            description: 'Whether to show the left slot toggle button in toolbars.',
            table: {
                defaultValue: { summary: 'true' },
                type: { summary: 'boolean' },
                category: 'left',
            },
        },
        isMobileLeftSlotOpen: {
            control: 'boolean',
            type: 'boolean',
            description:
                'Whether the mobile left slot drawer is open. Optional - if not provided, state is managed internally.',
            table: {
                type: { summary: 'boolean' },
                category: 'left',
            },
        },
        onMobileLeftSlotOpen: {
            type: 'function',
            description:
                'Callback when mobile left slot drawer open state changes. Use with isMobileLeftSlotOpen for controlled mode.',
            table: {
                type: { summary: '(open: boolean) => void' },
                category: 'left',
            },
            action: 'onMobileLeftSlotOpen',
        },
        mainSlotMinWidth: {
            control: { type: 'range', min: 300, max: 800, step: 50 },
            description: 'Minimum width of the grid container.',
            table: {
                defaultValue: { summary: '500' },
                type: { summary: 'number' },
                category: 'main',
            },
        },
        onScreenSizeChange: {
            type: 'function',
            description: 'Callback function to be called when the screen size changes.',
            table: {
                type: { summary: '(isMobile: boolean) => void' },
                category: 'main',
            },
            action: 'onScreenSizeChange',
        },
        // Common component props
        sx: {
            control: 'object',
            description: 'MUI System properties to customize the main element style.',
            table: {
                category: 'customization',
                type: { summary: 'SxProps<Theme>' },
                defaultValue: { summary: '{}' },
            },
        },
        className: {
            control: 'text',
            type: 'string',
            description: 'CSS class name applied to the main element.',
            table: {
                category: 'customization',
                type: { summary: 'string' },
            },
        },
    },
} satisfies Meta<typeof DataView>;

export default meta;

export {
    Default,
    WithDynamicWidthFilter,
    WithoutDetailAndFilter,
    WithMultimediaGrid,
    WithSelectionMode,
    WithBottomBarSelection,
};
