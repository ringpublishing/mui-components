import type { StoryObj } from '@storybook/react-vite';
import { WithSortableChipActionsExample } from './WithSortableChipActionsExample.js';
import { Autocomplete } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof Autocomplete>;

/**
 * Test fixture, deliberately not a demo.
 *
 * `!dev` keeps it out of the sidebar and `!autodocs` out of the Docs page, while the story stays
 * in the index so Playwright can still reach it by id. It is the repository's only composition of
 * `sortableChips` with a `renderChip` affordance of its own, and two e2e tests depend on exactly
 * that: `interactions/sortable.spec.ts` asserts a quick tap runs the consumer's handler instead of
 * picking the chip up, and `accessibility/sortable.spec.ts` scans it for WCAG violations. Deleting
 * it outright would drop the only coverage of the 125ms activation threshold colliding with a
 * consumer's own click handler — a gesture no unit test in this repo can stand in for.
 */
export const WithSortableChipActions: Story = {
    tags: ['!dev', '!autodocs'],
    parameters: {
        controls: { disable: true },
        actions: { disable: true },
    },
    args: {
        ...defaultArgs,
    },
    render: () => <WithSortableChipActionsExample />,
};
