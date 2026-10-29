import type { Meta } from '@storybook/react-vite';
import { Autocomplete, AutocompleteProps } from '../../../../src/index.js';
import defaultArgs from './common/defaultArgs.js';
import AutocompleteMDX from './Autocomplete.mdx';

import { Default as DefaultStory } from './stories/Default.js';
import { WithCaption as WithCaptionStory } from './stories/WithCaption.js';
import { WithAvatar as WithAvatarStory } from './stories/WithAvatar.js';
import { WithCustomisedAvatar as WithCustomisedAvatarStory } from './stories/WithCustomisedAvatar.js';
import { WithCustomisedChips as WithCustomisedChipsStory } from './stories/WithCustomisedChips.js';
import { WithCustomisedRenderOption as WithCustomisedRenderOptionStory } from './stories/WithCustomisedRenderOption.js';
import { WithMultipleSelection as WithMultipleSelectionStory } from './stories/WithMultipleSelection.js';
import { WithFreeSolo as WithFreeSoloStory } from './stories/WithFreeSolo.js';
import { WithDuplicateFeedback as WithDuplicateFeedbackStory } from './stories/WithDuplicateFeedback.js';
import { WithRecentlyUsed as WithRecentlyUsedStory } from './stories/WithRecentlyUsed.js';
import { WithAsynchronousRequests as WithAsynchronousRequestsStory } from './stories/WithAsynchronousRequests.js';
import { WithDropdownActions as WithDropdownActionsStory } from './stories/WithDropdownActions.js';
import { WithMultipleDropdownActions as WithMultipleDropdownActionsStory } from './stories/WithMultipleDropdownActions.js';
import { WithMenuListAction as WithMenuListActionStory } from './stories/WithMenuListAction.js';
import { WithChipActions as WithChipActionsStory } from './stories/WithChipActions.js';
import { WithChipDetails as WithChipDetailsStory } from './stories/WithChipDetails.js';
import { WithSortableChips as WithSortableChipsStory } from './stories/WithSortableChips.js';
import { FilterDefault as FilterDefaultStory } from './stories/FilterDefault.js';
import { FilterMultiple as FilterMultipleStory } from './stories/FilterMultiple.js';
import { FilterControlled as FilterControlledStory } from './stories/FilterControlled.js';
import { ChipsInputVariant as ChipsInputVariantStory } from './stories/ChipsInputVariant.js';
import { ChipsInputWithValidation as ChipsInputWithValidationStory } from './stories/ChipsInputWithValidation.js';
import { ChipsInputWithPaste as ChipsInputWithPasteStory } from './stories/ChipsInputWithPaste.js';
import { WithLongValue as WithLongValueStory } from './stories/WithLongValue.js';
import { WithSortableChipActions as SortableChipActionsFixture } from './stories/WithSortableChipActions.js';

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
        options: {
            control: 'object',
            description:
                'Values the dropdown offers. `onChange` returns them as given, except that `showRecentlyUsed` adds `groupBy` and `sortBy`.',
            table: {
                category: 'content',
                type: { summary: 'T[]' },
            },
        },
        value: {
            control: false,
            description: 'Selected value(s) in controlled mode. Pair it with `onChange`.',
            table: {
                category: 'state',
                type: { summary: 'T | T[] | null' },
            },
        },
        defaultValue: {
            control: false,
            description: 'Initially selected value(s) in uncontrolled mode.',
            table: {
                category: 'state',
                type: { summary: 'T | T[] | null' },
            },
        },
        onChange: {
            control: false,
            description:
                "Called when the selection changes. `reason` is MUI's reason, or `reorder` after a `sortableChips` drag; then `event` is a stand-in whose `currentTarget` is not the input.",
            table: {
                category: 'callbacks',
                type: { summary: '(event, value, reason, details?) => void' },
            },
        },
        getOptionLabel: {
            control: false,
            description: 'Resolves the text shown for an option. Defaults to reading `label`.',
            table: {
                category: 'content',
                type: { summary: '(option: T) => string' },
            },
        },
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
                'Labels of the field (required). `moreActions` names the actions menu button (default `More actions`); `searchPlaceholder` is for the `filter` variant.',
            table: {
                category: 'content',
                type: {
                    summary:
                        '{ title: ReactNode; inputPlaceholder?: string; recentlyUsed?: string; recentlyUsedResults?: string; moreActions?: string; searchPlaceholder?: string; }',
                },
            },
        },
        variant: {
            control: 'radio',
            options: ['default', 'filter', 'chipsInput'],
            description:
                'Input presentation. Filter mode uses a compact trigger and a popup search field. chipsInput is a free-text multi-value input that keeps every entry as a chip; it implies multiple and freeSolo.',
            table: { category: 'appearance', defaultValue: { summary: 'default' } },
        },
        searchTextFieldProps: {
            control: 'object',
            description: 'Props for the popup search field. Available only when variant is filter.',
            table: { category: 'customization' },
        },
        actions: {
            control: false,
            description:
                'Array of actions displayed as buttons/menu in the autocomplete input. Single action shows as icon button, multiple actions show as menu with EllipsisVertical icon.',
            table: {
                category: 'content',
                type: { summary: 'Action[]' },
            },
        },
        menuListActions: {
            control: 'object',
            description:
                'Heading and icon buttons at the top of the options list; with `groupBy` they sit next to the first group heading. Ignored when `renderGroup` is provided.',
            table: {
                category: 'content',
                type: {
                    summary:
                        '{ label?: string; actions: Array<{ label: string; icon: ReactNode; ariaLabel?: string; anchorRef?: Ref<HTMLButtonElement>; onClick?: MouseEventHandler; disabled?: boolean; disabledReason?: string }> }',
                },
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
        renderChip: {
            control: false,
            description:
                'Custom renderer called once for each selected value in multiple mode. The callback receives the original option, its resolved label, index, MUI Chip props including onDelete, and invalid (true when validateEntry rejected the entry). ' +
                'With sortableChips it also receives isDragActive, true while any chip drag is in progress — use it to suppress hover affordances such as tooltips.',
            table: {
                category: 'customization',
                type: {
                    summary: '(context: AutocompleteChipRenderContext<Value>) => ReactNode',
                },
            },
        },
        createChipsOnPaste: {
            control: 'boolean',
            description:
                'Splits pasted text into chips instead of pasting it into the input. The text typed in the input is replaced. Available only when variant is chipsInput.',
            table: {
                category: 'behavior',
                defaultValue: { summary: 'false' },
                type: { summary: 'boolean' },
            },
        },
        sortableChips: {
            control: 'boolean',
            description:
                'Lets the user reorder selected chips by pointer drag; `onChange` reports the order with the `reorder` reason. Ignored, with a console warning, without `multiple`, under `renderValue` or `renderTags`, and when `disabled` or `readOnly`. `limitTags` is ignored while it is on. Composes with `renderChip`.',
            table: {
                category: 'behavior',
                defaultValue: { summary: 'false' },
                type: { summary: 'boolean' },
            },
        },
        pasteSeparators: {
            control: 'object',
            description:
                'Separators used to split pasted text when createChipsOnPaste is on. Fragments are trimmed and empty ones are dropped. Available only when variant is chipsInput.',
            table: {
                category: 'behavior',
                defaultValue: { summary: "[',', ';', '\\n', '\\t']" },
                type: { summary: 'ReadonlyArray<string>' },
            },
        },
        validateEntry: {
            control: false,
            description:
                'Marks an entry as invalid: its chip renders in the error colour. It does not stop the entry from being added. Checked at render, so it also covers chips passed through value. slotProps.chip.color and renderChip take precedence over the colour. Available only when variant is chipsInput.',
            table: {
                category: 'validation',
                type: { summary: '(entry: Value | string) => boolean' },
            },
        },
        chipMaxWidth: {
            control: 'text',
            description:
                'Maximum width of a chip. A longer label is truncated with an ellipsis and the tooltip shows it in full. Change the width with this prop: a plain maxWidth in slotProps.chip.sx does not outrank it. Available only when variant is chipsInput.',
            table: {
                category: 'appearance',
                defaultValue: { summary: '150' },
                type: { summary: 'number | string' },
            },
        },
        duplicateEntryMessage: {
            control: false,
            description:
                'Message rendered under the field when a freeSolo entry is rejected for being already selected. MUI drops such an entry without calling onChange or onInputChange, so the rejection is otherwise silent. Pass a callback to quote the rejected text in the message. While it shows, the field is in the error state; it clears on the next input or value change. Requires multiple and freeSolo, which the chipsInput variant implies. After a paste it shows the first rejected fragment.',
            table: {
                category: 'validation',
                type: { summary: 'React.ReactNode | ((entry: string) => React.ReactNode)' },
            },
        },
        onDuplicateEntry: {
            control: false,
            description:
                'Called when a freeSolo entry is rejected for being already selected, with the text that was rejected. A keyboard event comes from typing and Enter, a clipboard event from a paste in the chipsInput variant (called once per rejected fragment). Use it to drive feedback of your own. duplicateEntryMessage covers the common case and needs no handler. Requires multiple and freeSolo, which the chipsInput variant implies.',
            table: {
                category: 'callbacks',
                type: {
                    summary:
                        '(event: React.KeyboardEvent<HTMLDivElement> | React.ClipboardEvent<HTMLDivElement>, entry: string) => void',
                },
            },
        },
        dataTestIdSuffix: {
            control: 'text',
            description:
                'Suffix of every `data-testid`: root `ring-autocomplete-{suffix}`, then `-textfield`, `-input`, `-chip-<index>`.',
            table: {
                category: 'customization',
                type: { summary: 'string' },
            },
        },
    },
} satisfies Meta<AutocompleteProps>;

export default meta;

export const Default = DefaultStory;
export const WithCaption = { ...WithCaptionStory, name: 'Caption' };
export const WithAvatar = { ...WithAvatarStory, name: 'Avatar' };
export const WithCustomisedAvatar = { ...WithCustomisedAvatarStory, name: 'Avatar — customised' };
export const WithCustomisedChips = { ...WithCustomisedChipsStory, name: 'Customised chips' };
export const WithCustomisedRenderOption = { ...WithCustomisedRenderOptionStory, name: 'Customised renderOption' };
export const WithMultipleSelection = { ...WithMultipleSelectionStory, name: 'Multiple selection' };
export const WithFreeSolo = { ...WithFreeSoloStory, name: 'Free solo' };
export const WithDuplicateFeedback = {
    ...WithDuplicateFeedbackStory,
    name: 'Free solo — duplicate feedback',
    tags: ['new@2.0'],
};
export const WithRecentlyUsed = { ...WithRecentlyUsedStory, name: 'Recently used' };
export const WithAsynchronousRequests = { ...WithAsynchronousRequestsStory, name: 'Asynchronous requests' };
export const WithDropdownActions = { ...WithDropdownActionsStory, name: 'Dropdown actions' };
export const WithMultipleDropdownActions = { ...WithMultipleDropdownActionsStory, name: 'Dropdown actions — multiple' };
export const WithMenuListAction = { ...WithMenuListActionStory, name: 'Menu list action' };
export const WithChipActions = { ...WithChipActionsStory, name: 'Chip actions' };
export const WithChipDetails = { ...WithChipDetailsStory, name: 'Chip details' };
export const WithSortableChips = {
    ...WithSortableChipsStory,
    name: 'Sortable chips',
    tags: ['new@2.0'],
};
export const FilterDefault = { ...FilterDefaultStory, name: 'Filter' };
export const FilterMultiple = { ...FilterMultipleStory, name: 'Filter — multiple' };
export const FilterControlled = { ...FilterControlledStory, name: 'Filter — controlled' };
export const ChipsInputVariant = { ...ChipsInputVariantStory, name: 'Chips input', tags: ['new@2.0'] };
export const ChipsInputWithValidation = {
    ...ChipsInputWithValidationStory,
    name: 'Chips input — validation',
    tags: ['new@2.0'],
};
export const ChipsInputWithPaste = { ...ChipsInputWithPasteStory, name: 'Chips input — paste', tags: ['new@2.0'] };
export const WithLongValue = { ...WithLongValueStory, name: 'Long value' };

/*
 * Test fixture, not a demo: `!dev` keeps it out of the sidebar and `!autodocs` off the Docs page,
 * while the story stays in the index so Playwright can reach it by id. The tags have to be declared
 * here — Storybook indexes this file statically, so tags carried by a re-exported story object are
 * invisible to it.
 */
export const WithSortableChipActions = {
    ...SortableChipActionsFixture,
    name: 'Sortable chips — actions',
    tags: ['!dev', '!autodocs'],
};
