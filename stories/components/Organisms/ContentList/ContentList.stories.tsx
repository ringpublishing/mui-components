import type { Meta } from '@storybook/react-vite';
import { ContentList } from '../../../../src/index.js';
import { Default } from './stories/Default.js';
import defaultArgs from './common/defaultArgs.js';
import ContentListMDX from './ContentList.mdx';

const meta: Meta<typeof ContentList> = {
    component: ContentList,
    parameters: {
        docs: {
            page: ContentListMDX,
        },
    },
    args: {
        ...defaultArgs,
    },
    argTypes: {
        inputData: {
            description: 'Array of objects containing header, children, and optional metadata for each content section',
            control: 'object',
            table: {
                category: 'content',
                type: { summary: 'InputDataProps[]' },
            },
        },
        listHeader: {
            description:
                'Additional header element rendered above the navigation list on the left side. Accepts JSX element, string, or React node',
            control: false,
            table: {
                category: 'content',
                type: { summary: 'ReactNode | JSX.Element | string' },
            },
        },
        selectedItemIndex: {
            description: 'The index of the selected item',
            control: 'number',
            table: {
                category: 'behavior',
                defaultValue: { summary: '0' },
            },
        },
        onHeaderClick: {
            description: 'Function called after clicking on the header on the left side',
            control: false,
            table: {
                category: 'behavior',
                type: { summary: '(item: InputDataProps, index: number) => void' },
            },
        },
        containerSx: {
            description: 'Custom styles for the content container on the right side',
            control: 'object',
            table: {
                category: 'customization',
                type: { summary: 'SxProps<Theme>' },
            },
        },
        dataTestIdSuffix: {
            description:
                'Optional suffix added to data-testid attributes for E2E testing. Results in data-testid="ring-contentlist-{suffix}"',
            control: 'text',
            table: {
                category: 'testing',
            },
        },
        sx: {
            description: 'Custom MUI sx prop for styling the root container',
            control: 'object',
            table: {
                category: 'customization',
                type: { summary: 'SxProps<Theme>' },
            },
        },
        className: {
            description: 'CSS class name to be applied to the root container',
            control: 'text',
            table: {
                category: 'customization',
            },
        },
    },
};

export default meta;

export { Default };
