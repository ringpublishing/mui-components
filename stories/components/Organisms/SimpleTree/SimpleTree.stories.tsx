import type { Meta } from '@storybook/react-vite';
import { SimpleTree } from '../../../../src/index.js';
import { Default as DefaultStory } from './stories/Default.js';
import { WithSearch as WithSearchStory } from './stories/WithSearch.js';
import { WithDynamicLoading as WithDynamicLoadingStory } from './stories/WithDynamicLoading.js';
import { WithCustomElements as WithCustomElementsStory } from './stories/WithCustomElements.js';
import { WithPersistence as WithPersistenceStory } from './stories/WithPersistence.js';
import { ControlledSelection as ControlledSelectionStory } from './stories/ControlledSelection.js';
import { WithExternalQueryClient as WithExternalQueryClientStory } from './stories/WithExternalQueryClient.js';
import defaultArgs from './common/defaultArgs.js';
import SimpleTreeMdx from './SimpleTree.mdx';

const meta: Meta<typeof SimpleTree> = {
    component: SimpleTree,
    parameters: {
        docs: {
            page: SimpleTreeMdx,
        },
        layout: 'fullscreen',
    },
    args: {
        ...defaultArgs,
    },
    argTypes: {
        sx: {
            control: 'object',
            description: 'MUI System properties for custom styling.',
            table: {
                category: 'customization',
                type: { summary: 'SxProps<Theme>' },
                defaultValue: { summary: '{}' },
            },
        },
        className: {
            control: 'text',
            description: 'CSS class name applied to the root element.',
            table: {
                category: 'customization',
                type: { summary: 'string' },
            },
        },
        dataTestIdSuffix: {
            control: 'text',
            description: 'Suffix for data-testid attributes.',
            table: {
                category: 'testing',
                type: { summary: 'string' },
            },
        },
        items: {
            control: 'object',
            description: 'Tree items to display.',
            table: {
                category: 'content',
                type: { summary: 'SimpleTreeItem[]' },
            },
        },
        withSearch: {
            control: 'boolean',
            description: 'Show search box for filtering items by label.',
            table: {
                category: 'behavior',
                defaultValue: { summary: 'false' },
                type: { summary: 'boolean' },
            },
        },
        searchDebounceTime: {
            control: 'number',
            description: 'Debounce time for search in milliseconds.',
            table: {
                category: 'behavior',
                defaultValue: { summary: '500' },
                type: { summary: 'number' },
            },
        },
        searchPlaceholder: {
            control: 'text',
            description: 'Placeholder text for the search input.',
            table: {
                category: 'content',
                type: { summary: 'string' },
            },
        },
        selectedItems: {
            control: 'object',
            description: 'Controlled selected item IDs.',
            table: {
                category: 'state',
                type: { summary: 'string[]' },
            },
        },
        onSelectedItemsChange: {
            control: false,
            description: 'Callback fired when selection changes.',
            table: {
                category: 'callbacks',
                type: { summary: '(itemIds: string[]) => void' },
            },
        },
        onExpand: {
            control: false,
            description: 'Callback fired when an item is expanded or collapsed.',
            table: {
                category: 'callbacks',
                type: { summary: '(itemId: string) => void' },
            },
        },
        onClickRow: {
            control: false,
            description: 'Callback fired when a row is clicked.',
            table: {
                category: 'callbacks',
                type: { summary: '(itemId: string) => void' },
            },
        },
        persistence: {
            control: 'object',
            description:
                'Enable localStorage persistence. Provide `cacheKey` to cache dynamic items, `restoreExpandedItems` to restore expanded state, and `restoreSelectedItem` to restore the last selected item.',
            table: {
                category: 'behavior',
                type: {
                    summary: '{ cacheKey: string; restoreExpandedItems?: boolean; restoreSelectedItem?: boolean }',
                },
            },
        },
        queryClient: {
            control: false,
            description:
                'Your TanStack Query client for `loadItems`. Needs the dynamic loading setup; ignored without `loadItems`.',
            table: { category: 'behavior', type: { summary: 'TreeQueryClient' } },
        },
    },
};

export default meta;

export const Default = DefaultStory;
export const WithSearch = { ...WithSearchStory, name: 'Search' };
export const WithDynamicLoading = { ...WithDynamicLoadingStory, name: 'Dynamic loading' };
export const WithCustomElements = { ...WithCustomElementsStory, name: 'Custom elements' };
export const WithPersistence = { ...WithPersistenceStory, name: 'Persistence' };
export const ControlledSelection = { ...ControlledSelectionStory, name: 'Controlled selection' };
export const WithExternalQueryClient = { ...WithExternalQueryClientStory, name: 'External QueryClient' };
