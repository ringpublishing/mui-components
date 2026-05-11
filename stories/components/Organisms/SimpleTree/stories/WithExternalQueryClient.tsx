import { Suspense, lazy } from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../../../../helpers.js';
import WithExternalQueryClientExampleCode from './code/WithExternalQueryClientExample.tsx?raw';
import { SimpleTree, SimpleTreeItem } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof SimpleTree>;

const storyItems: SimpleTreeItem[] = [
    {
        itemId: 'root',
        label: 'Root',
        items: [
            {
                itemId: 'lazy',
                label: 'Loads children on expand',
                loadItems: async (): Promise<SimpleTreeItem[]> => {
                    await new Promise((r) => setTimeout(r, 400));

                    return [{ itemId: 'child-1', label: 'Loaded child' }];
                },
            },
        ],
    },
];

// Demo body lives in a side module so this story registration file does not
// statically import `@tanstack/react-query`. Otherwise loading any sibling
// tree story (Default, WithSearch, …) would also pull react-query in via
// the shared *.stories.tsx aggregator and break when the optional peer
// dep is uninstalled.
const Demo = lazy(() => import('./WithExternalQueryClient.demo.js'));

export const WithExternalQueryClient: Story = {
    parameters: {
        layout: 'fullscreen',
    },
    args: {
        ...defaultArgs,
        items: storyItems,
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customCode: WithExternalQueryClientExampleCode,
            example: (
                <Suspense fallback={<div style={{ padding: 16, fontFamily: 'monospace', opacity: 0.6 }}>Loading…</div>}>
                    <Demo {...args} />
                </Suspense>
            ),
        }),
};
