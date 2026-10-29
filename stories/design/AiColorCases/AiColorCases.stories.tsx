import type { Meta, StoryObj } from '@storybook/react-vite';
import { Chip } from '@mui/material';

import AiColorCasesMdx from './AiColorCases.mdx';

// One sidebar entry for the whole AI motif, holding a single Docs page on which
// every design case renders as an editable canvas. Two constraints shape it:
//
// - `!dev` must be re-declared HERE, in the file the static CSF indexer reads;
//   a `tags` inside a re-exported module is ignored.
// - The docs page must stay ATTACHED (`docs.page` + `isTemplate` MDX), or
//   `<Canvas of={...} />` cannot resolve the stories.
//
// The MDX itself carries no JSX comment on purpose: Prettier reads a top-level
// `{/* … */}` in an `.mdx` file as markdown emphasis and rewrites it to
// `{/_ … _/}`, which acorn then refuses to parse and the page stops indexing.
import { MediaCardFlag as MediaCardFlagCase } from './stories/MediaCardFlag.js';
import { MediaFlag as MediaFlagCase } from './stories/MediaFlag.js';
import { StatusLabelBacking as StatusLabelBackingCase } from './stories/StatusLabelBacking.js';
import { Chips as ChipsCase } from './stories/Chips.js';
import { Buttons as ButtonsCase } from './stories/Buttons.js';
import { IconButtons as IconButtonsCase } from './stories/IconButtons.js';
import { GradientText as GradientTextCase } from './stories/GradientText.js';
import { InlineAiMarker as InlineAiMarkerCase } from './stories/InlineAiMarker.js';
import { Autocomplete as AutocompleteCase } from './stories/Autocomplete.js';
import { FieldLabels as FieldLabelsCase } from './stories/FieldLabels.js';

export const MediaCardFlag: StoryObj = { ...MediaCardFlagCase, name: 'AI flag on a card', tags: ['!dev'] };
export const MediaFlag: StoryObj = { ...MediaFlagCase, name: 'The same flag through Media', tags: ['!dev'] };
export const StatusLabelBacking: StoryObj = {
    ...StatusLabelBackingCase,
    name: 'Backing on plain status labels',
    tags: ['!dev'],
};
export const Chips: StoryObj = { ...ChipsCase, name: 'AI flag on its own', tags: ['!dev'] };
export const Autocomplete: StoryObj = { ...AutocompleteCase, name: 'AI chips in an Autocomplete', tags: ['!dev'] };
export const IconButtons: StoryObj = { ...IconButtonsCase, name: 'AI icon button', tags: ['!dev'] };
export const Buttons: StoryObj = { ...ButtonsCase, name: 'AI button', tags: ['!dev'] };
export const GradientText: StoryObj = { ...GradientTextCase, name: 'Gradient text', tags: ['!dev'] };
export const InlineAiMarker: StoryObj = { ...InlineAiMarkerCase, name: 'Inline "(AI)" marker', tags: ['!dev'] };
export const FieldLabels: StoryObj = { ...FieldLabelsCase, name: 'AI markers in control labels', tags: ['!dev'] };

const meta: Meta<typeof Chip> = {
    // The entry is a topic, not a component — the autotitle would surface the
    // directory name ("AiColorCases"). `main.ts` prefixes `Design/`.
    // eslint-disable-next-line storybook/no-title-property-in-meta
    title: 'AI color',
    component: Chip,
    parameters: {
        docs: {
            page: AiColorCasesMdx,
        },
        controls: { disable: true },
        actions: { disable: true },
    },
};

export default meta;
