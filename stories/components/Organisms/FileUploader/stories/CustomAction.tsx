import type { StoryObj } from '@storybook/react-vite';
import { Button, Stack } from '@mui/material';
import { createCodeStory } from '../../../../helpers.js';
import CustomActionExampleCode from './code/CustomActionExample.tsx?raw';
import { FileUploader } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof FileUploader>;

const Example = (args: React.ComponentProps<typeof FileUploader>): React.JSX.Element => {
    const handleCustomAction = (): void => {
        // eslint-disable-next-line no-console
        console.log('Custom action clicked - e.g., open external file picker');
    };

    return (
        <Stack alignItems="center" justifyContent="center" sx={{ minHeight: '80vh' }}>
            <FileUploader
                {...args}
                action={
                    <Button variant="outlined" onClick={handleCustomAction}>
                        From Source
                    </Button>
                }
                sx={{ maxWidth: 600 }}
            />
        </Stack>
    );
};

export const CustomAction: Story = {
    args: {
        ...defaultArgs,
    },
    render: (args, context) => {
        if (context?.viewMode === 'story') {
            return <Example {...args} />;
        }

        return createCodeStory({
            context,
            customProps: {},
            customCode: CustomActionExampleCode,
            example: <Example {...args} />,
        });
    },
};
