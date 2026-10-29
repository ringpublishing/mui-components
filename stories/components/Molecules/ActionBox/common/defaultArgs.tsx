import { Ban, ArrowUpDown, Rocket } from 'lucide-react';
import { action } from 'storybook/actions';
import { ActionBoxProps, ActionBoxItem } from '../../../../../src/index.js';

const actions: ActionBoxItem[] = [
    {
        label: 'Action 1',
        onClick: action('onClick'),
        icon: <Rocket />,
        hasSeparatorAfter: true,
    },
    {
        label: 'Action 2',
        onClick: action('onClick'),
        disabled: true,
        disabledReason: 'Disabled because of some reason',
        icon: <Ban />,
    },
    {
        label: 'Action 3',
        onClick: () => null,
    },
    {
        label: 'Action 4',
        onClick: () => null,
        icon: <ArrowUpDown />,
        hasSeparatorBefore: true,
    },
];

const defaultArgs: Partial<ActionBoxProps> = {
    actions,
    placement: 'bottom-end',
    tooltipPlacement: 'right',
    className: 'custom-class-name',
    sx: {},
};

export default defaultArgs;
