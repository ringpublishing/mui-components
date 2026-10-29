import type { Meta, StoryObj } from '@storybook/react-vite';

import { Autocomplete } from '../../../../src/index.js';
import { caseStory } from '../../../design/caseStory.js';
import ChipsInputMigrationMdx from './ChipsInputMigration.mdx';
import TagsExample from './code/TagsExample.js';
import TagsExampleCode from './code/TagsExample.tsx?raw';
import IdFilterExample from './code/IdFilterExample.js';
import IdFilterExampleCode from './code/IdFilterExample.tsx?raw';
import ObjectsExample from './code/ObjectsExample.js';
import ObjectsExampleCode from './code/ObjectsExample.tsx?raw';
import PlaceholderExample from './code/PlaceholderExample.js';
import PlaceholderExampleCode from './code/PlaceholderExample.tsx?raw';
import ColorsExample from './code/ColorsExample.js';
import ColorsExampleCode from './code/ColorsExample.tsx?raw';
import SuggestionsExample from './code/SuggestionsExample.js';
import SuggestionsExampleCode from './code/SuggestionsExample.tsx?raw';

// One Docs page, no sidebar entries of its own: every example renders through a story so the Ring theme
// decorator reaches it. `!dev` is repeated here because only tags in the file the indexer reads count.
export const Tags: StoryObj = { ...caseStory(TagsExample, TagsExampleCode), name: 'A tags field', tags: ['!dev'] };
export const IdFilter: StoryObj = {
    ...caseStory(IdFilterExample, IdFilterExampleCode),
    name: 'An identifier filter',
    tags: ['!dev'],
};
export const Objects: StoryObj = {
    ...caseStory(ObjectsExample, ObjectsExampleCode),
    name: 'Keeping objects in state',
    tags: ['!dev'],
};
export const Placeholder: StoryObj = {
    ...caseStory(PlaceholderExample, PlaceholderExampleCode),
    name: 'Placeholder before focus',
    tags: ['!dev'],
};
export const Colors: StoryObj = {
    ...caseStory(ColorsExample, ColorsExampleCode),
    name: 'Custom chip colours',
    tags: ['!dev'],
};
export const Suggestions: StoryObj = {
    ...caseStory(SuggestionsExample, SuggestionsExampleCode),
    name: 'New: suggestions',
    tags: ['!dev'],
};

const meta: Meta<typeof Autocomplete> = {
    // A 2.0.0 migration topic, not a component; `main.ts` prefixes `Migration FAQ/`.
    // eslint-disable-next-line storybook/no-title-property-in-meta
    title: 'Breaking Version Upgrades/2.0.0/ChipsInput Migration',
    component: Autocomplete,
    parameters: {
        docs: {
            page: ChipsInputMigrationMdx,
        },
        controls: { disable: true },
        actions: { disable: true },
    },
};

export default meta;
