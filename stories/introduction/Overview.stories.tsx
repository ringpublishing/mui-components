import type { Meta, StoryObj } from '@storybook/react-vite';
import { Overview as OverviewComponent } from './Overview.js';

// Single-story hoisting: `tags: ['!autodocs']` + story name === last title segment
// flattens to one sidebar leaf. Real story so the global decorator wraps it in <ThemeConfig>.
const meta: Meta<typeof OverviewComponent> = {
    component: OverviewComponent,
    tags: ['!autodocs'],
    parameters: {
        layout: 'fullscreen',
        // The panel itself is hidden by manager.ts; the tabs are disabled for any other way in.
        hidePanel: true,
        controls: { disable: true },
        actions: { disable: true },
        interactions: { disable: true },
    },
};

export default meta;

export const Overview: StoryObj<typeof OverviewComponent> = {};
