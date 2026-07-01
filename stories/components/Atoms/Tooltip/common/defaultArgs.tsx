import { TooltipProps } from '../../../../../src/index.js';
import { Button } from '@mui/material';

const defaultArgs: Partial<TooltipProps> = {
    // eslint-disable-next-line storybook/no-title-property-in-meta -- `title` is a Tooltip component prop, not a Storybook meta title
    title: 'Title',
    arrow: true,
    children: <Button variant={'outlined'}>Hover me</Button>,
};

export default defaultArgs;
