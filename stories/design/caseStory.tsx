import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { createCodeStory } from '../helpers.js';

/**
 * Builds one design case from the snippet file it displays: the same module is
 * rendered as the example and shown as the editable source, so the two cannot
 * drift apart.
 *
 * `tags` is repeated in each topic's `*.stories.tsx` because only the tags
 * declared in the file the static CSF indexer reads take effect.
 */
export function caseStory(Example: () => React.JSX.Element, customCode: string): StoryObj {
    return {
        tags: ['!dev'],
        render: (args, context): React.JSX.Element =>
            context?.viewMode === 'story' ? (
                <Example />
            ) : (
                createCodeStory({ context, customCode, example: <Example /> })
            ),
    };
}
