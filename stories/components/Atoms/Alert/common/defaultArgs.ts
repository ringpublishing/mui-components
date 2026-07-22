import { AlertProps } from '../../../../../src/index.js';

const defaultArgs: Partial<AlertProps> = {
    // eslint-disable-next-line storybook/no-title-property-in-meta -- `title` is a prop of the Alert component, not the storybook meta
    title: 'Alert title',
    severity: 'info',
    description: 'This is an alert description.',
    layoutVariant: 'outline',
    actionsPlacement: 'right',
};

export default defaultArgs;
