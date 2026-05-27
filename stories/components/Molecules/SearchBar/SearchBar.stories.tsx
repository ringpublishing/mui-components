import type { Meta } from '@storybook/react-vite';
import { SearchBar } from '../../../../src/index.js';
import { searchBoxArgTypes } from '../SearchBox/common/argTypes.js';
import { Default } from './stories/Default.js';
import { ClassSelectorChildrenStack } from './stories/ClassSelectorChildrenStack.js';
import { Controlled } from './stories/Controlled.js';
import defaultArgs from './common/defaultArgs.js';
import SearchBarMdx from './SearchBar.mdx';

const meta: Meta<typeof SearchBar> = {
    component: SearchBar,
    parameters: {
        docs: {
            page: SearchBarMdx,
            description: {
                component: `SearchBar is a comprehensive search component that combines a search input field with customizable action buttons and controls. It supports both controlled and uncontrolled modes, debounced search functionality, and a clearable input option. The component is built on top of Material-UI and provides flexible styling options through className and sx props.`,
            },
        },
    },
    args: {
        ...defaultArgs,
    },
    argTypes: {
        ...searchBoxArgTypes,
        children: {
            description: 'Action buttons, controls, or other elements to display alongside the search input.',
            table: {
                category: 'content',
                type: { summary: 'React.ReactNode' },
            },
        },
    },
};

export default meta;

export { Default, ClassSelectorChildrenStack, Controlled };
