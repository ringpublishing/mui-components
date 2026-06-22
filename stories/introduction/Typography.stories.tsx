import type { Meta, StoryObj } from '@storybook/react-vite';
import { TypographyExample } from './Typography.js';

// Single-story hoisting: `tags: ['!autodocs']` + story name === last title segment
// flattens to one sidebar leaf. Real story so the global decorator wraps it in <ThemeConfig>.
const meta: Meta<typeof TypographyExample> = {
    component: TypographyExample,
    tags: ['!autodocs'],
    parameters: {
        layout: 'fullscreen',
        controls: { disable: true },
        actions: { disable: true },
        interactions: { disable: true },
    },
};

export default meta;

export const Typography: StoryObj<typeof TypographyExample> = {};
