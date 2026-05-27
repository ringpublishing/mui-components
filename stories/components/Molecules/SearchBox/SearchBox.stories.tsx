import type { Meta } from '@storybook/react-vite';
import { SearchBox } from '../../../../src/index.js';
import { searchBoxArgTypes } from './common/argTypes.js';
import defaultArgs from './common/defaultArgs.js';
import SearchBoxMdx from './SearchBox.mdx';
import { Controlled } from './stories/Controlled.js';
import { Default } from './stories/Default.js';

const meta: Meta<typeof SearchBox> = {
    component: SearchBox,
    parameters: {
        docs: {
            page: SearchBoxMdx,
            description: {
                component: `SearchBox is a lightweight search component that provides a simple search input field with customizable styling and behavior. It supports both controlled and uncontrolled modes, debounced search functionality, and a clearable input option. The component is built on top of Material-UI and provides flexible styling options through className and sx props.`,
            },
        },
    },
    args: {
        ...defaultArgs,
    },
    argTypes: searchBoxArgTypes,
};

export default meta;

export { Default, Controlled };
