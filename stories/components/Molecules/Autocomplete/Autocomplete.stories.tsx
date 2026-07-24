import type { Meta } from '@storybook/react-vite';
import { Autocomplete } from '../../../../src/index.js';
import defaultArgs from './common/defaultArgs.js';
import AutocompleteMDX from './Autocomplete.mdx';

import { Default } from './stories/Default.js';
import { WithDropdownActions } from './stories/WithDropdownActions.js';
import { WithMultipleSelection } from './stories/WithMultipleSelection.js';
import { WithMultipleDropdownActions } from './stories/WithMultipleDropdownActions.js';
import { WithRecentlyUsed } from './stories/WithRecentlyUsed.js';
import { WithCaption } from './stories/WithCaption.js';
import { WithAvatar } from './stories/WithAvatar.js';
import { WithCustomisedAvatar } from './stories/WithCustomisedAvatar.js';
import { WithAsynchronousRequests } from './stories/WithAsynchronousRequests.js';
import { WithCustomisedChips } from './stories/WithCustomisedChips.js';
import { WithCustomisedRenderOption } from './stories/WithCustomisedRenderOption.js';
import { WithFreeSolo } from './stories/WithFreeSolo.js';
import { WithOutlinedTextField } from './stories/WithOutlinedTextField.js';

const meta = {
    component: Autocomplete,
    parameters: {
        docs: {
            page: AutocompleteMDX,
        },
    },
    args: {
        ...defaultArgs,
    },
    argTypes: {
        sx: {
            control: 'object',
            description: 'MUI System properties to customize the main element style.',
            table: {
                category: 'customization',
                type: { summary: 'SxProps<Theme>' },
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
        labels: {
            control: 'object',
            description:
                'Labels configuration for the autocomplete (required). Includes title, inputPlaceholder, recentlyUsed, and recentlyUsedResults.',
            table: {
                category: 'content',
                type: {
                    summary:
                        '{ title: string; inputPlaceholder?: string; recentlyUsed?: string; recentlyUsedResults?: string; }',
                },
            },
        },
        actions: {
            control: false,
            description:
                'Array of actions displayed as buttons/menu in the autocomplete input. Single action shows as icon button, multiple actions show as menu with MoreVert icon.',
            table: {
                category: 'content',
                type: { summary: 'Action[]' },
            },
        },
        showRecentlyUsed: {
            control: 'boolean',
            description: 'Show recently used items grouped separately in the dropdown.',
            table: {
                category: 'behavior',
                defaultValue: { summary: 'false' },
                type: { summary: 'boolean' },
            },
        },
        recentlyLocalStorageKey: {
            control: 'text',
            description: 'Local storage key for recently used items. Required when showRecentlyUsed is true.',
            table: {
                category: 'behavior',
                type: { summary: 'string' },
            },
        },
        recentlyUsedLimit: {
            control: 'number',
            description: 'Maximum number of recently used items to store.',
            table: {
                category: 'behavior',
                defaultValue: { summary: '3' },
                type: { summary: 'number' },
            },
        },
        slotProps: {
            control: 'object',
            description: 'Props for slot components including textField and chip. Extends MUI Autocomplete slotProps.',
            table: {
                category: 'customization',
                type: {
                    summary: '{ textField?: TextFieldProps; chip?: ChipProps; } & MuiAutocompleteProps["slotProps"]',
                },
            },
        },
        dataTestIdSuffix: {
            control: 'text',
            description: 'Suffix for data-testid attribute. Results in data-testid="ring-Autocomplete-{suffix}".',
            table: {
                category: 'testing',
                type: { summary: 'string' },
            },
        },
    },
} satisfies Meta<typeof Autocomplete>;

export default meta;

export {
    Default,
    WithDropdownActions,
    WithMultipleSelection,
    WithMultipleDropdownActions,
    WithRecentlyUsed,
    WithCaption,
    WithAvatar,
    WithCustomisedAvatar,
    WithAsynchronousRequests,
    WithCustomisedChips,
    WithCustomisedRenderOption,
    WithFreeSolo,
    WithOutlinedTextField,
};
