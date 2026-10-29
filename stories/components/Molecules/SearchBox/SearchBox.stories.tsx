import type { Meta } from '@storybook/react-vite';
import { SearchBox } from '../../../../src/index.js';
import { searchBoxArgTypes } from './common/argTypes.js';
import defaultArgs from './common/defaultArgs.js';
import SearchBoxMdx from './SearchBox.mdx';
import { Default as DefaultStory } from './stories/Default.js';
import { Sizes as SizesStory } from './stories/Sizes.js';
import { WithLongValue as WithLongValueStory } from './stories/WithLongValue.js';
import { Controlled as ControlledStory } from './stories/Controlled.js';

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

export const Default = DefaultStory;
export const Sizes = { ...SizesStory, tags: ['new@2.0'] };
export const WithLongValue = { ...WithLongValueStory, name: 'Long value' };
export const Controlled = ControlledStory;
