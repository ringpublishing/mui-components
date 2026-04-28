import { MediaCardProps } from '../../../../../src/index.js';

const defaultArgs: Partial<MediaCardProps> = {
    // eslint-disable-next-line storybook/no-title-property-in-meta -- `title` is a MediaCard component prop, not a Storybook meta title
    title: 'Title / name',
    variant: 'outlined',
    square: false,
    objectFit: 'fill',
    ratio: '16/9',
    sx: { width: '300px' },
};

export default defaultArgs;
