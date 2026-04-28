import type { Meta } from '@storybook/react-vite';
import { EditableText } from '../../../../src/index.js';
import { Default } from './stories/Default.js';
import { WithLabel } from './stories/WithLabel.js';
import { WithSubmitFailure } from './stories/WithSubmitFailure.js';
import defaultArgs from './common/defaultArgs.js';
import EditableTextMdx from './EditableText.mdx';

const meta: Meta<typeof EditableText> = {
    component: EditableText,
    parameters: {
        docs: {
            page: EditableTextMdx,
        },
    },
    args: {
        ...defaultArgs,
    },
    argTypes: {
        text: {
            control: 'text',
            description: 'The initial text to be displayed.',
            table: {
                category: 'content',
                type: { summary: 'string' },
            },
        },
        label: {
            control: 'text',
            description: 'Optional label for the TextField shown in edit mode.',
            table: {
                category: 'content',
                type: { summary: 'string' },
            },
        },
        onSubmit: {
            description:
                'Callback invoked when the user submits the edited text. Should return a Promise resolving to true on success or false on failure. On failure, the text reverts to its previous value.',
            table: {
                category: 'callbacks',
                type: { summary: '(value: string) => Promise<boolean>' },
            },
        },
        slotProps: {
            control: 'object',
            description:
                'Props to customize internal component slots. `typography` accepts MUI TypographyProps (except `children`) and is applied to the text in display mode. `textField` accepts MUI TextFieldProps (except `value`, `onChange`, `autoFocus`) and is applied to the input in edit mode.',
            table: {
                category: 'customization',
                type: {
                    summary: 'EditableTextSlotProps',
                    detail: '{ typography?: Omit<TypographyProps, "children">; textField?: Omit<TextFieldProps, "value" | "onChange" | "autoFocus"> }',
                },
            },
        },
        sx: {
            control: 'object',
            description: 'MUI sx prop for custom styling of the root element.',
            table: {
                category: 'customization',
                type: { summary: 'SxProps' },
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
            description: 'Suffix appended to the data-testid attribute.',
            table: {
                category: 'customization',
                type: { summary: 'string' },
            },
        },
    },
};

export default meta;

export { Default, WithLabel, WithSubmitFailure };
