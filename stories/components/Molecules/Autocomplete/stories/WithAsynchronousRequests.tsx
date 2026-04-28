import React, { useState } from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import WithAsynchronousRequestsExampleCode from './code/WithAsynchronousRequestsExample.tsx?raw';
import { Autocomplete, AutocompleteProps } from '../../../../../src/index.js';
import defaultArgs, { options, Option } from '../common/defaultArgs.js';

type Story = StoryObj<typeof Autocomplete>;

function delaySleep(delay = 0): Promise<Option[]> {
    return new Promise((resolve) => {
        setTimeout(() => resolve(options), delay);
    });
}

const WithAsynchronousRequestsExample = (props: AutocompleteProps): React.JSX.Element => {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<Option[]>([]);
    const [loading, setLoading] = useState(false);

    const handleOpen = async (): Promise<void> => {
        setOpen(true);

        if (items.length > 0) {
            return;
        }

        setLoading(true);

        try {
            const data = await delaySleep(1000);
            setItems(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Autocomplete
                {...props}
                open={(!loading && open) || (open && items.length > 0)}
                onOpen={handleOpen}
                onClose={(): void => setOpen(false)}
                loading={loading}
                options={items}
                sx={{ width: 300 }}
            />
        </div>
    );
};

export const WithAsynchronousRequests: Story = {
    parameters: {
        controls: { disable: true },
        actions: { disable: true },
    },
    args: {
        ...defaultArgs,
        options: [],
        loading: true,
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: args,
            customCode: WithAsynchronousRequestsExampleCode,
            example: <WithAsynchronousRequestsExample {...(args as AutocompleteProps)} />,
        }),
};
