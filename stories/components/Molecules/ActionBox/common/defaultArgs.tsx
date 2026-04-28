import { DoNotDisturb, ImportExport, RocketLaunch } from '@mui/icons-material';
import { action } from 'storybook/actions';
import { ActionBoxProps, ActionBoxItem } from '../../../../../src/index.js';

const actions: ActionBoxItem[] = [
    {
        label: 'Action 1',
        onClick: action('onClick'),
        icon: <RocketLaunch />,
        hasSeparatorAfter: true,
    },
    {
        label: 'Action 2',
        onClick: action('onClick'),
        disabled: true,
        disabledReason: 'Disabled because of some reason',
        icon: <DoNotDisturb />,
    },
    {
        label: 'Action 3',
        onClick: () => null,
    },
    {
        label: 'Action 4',
        onClick: () => null,
        icon: <ImportExport />,
        hasSeparatorBefore: true,
    },
];

const defaultArgs: Partial<ActionBoxProps> = {
    actions,
    placement: 'bottom-end',
    tooltipPlacement: 'right',
    hasScroll: true,
    visibleActionsCount: 3,
    className: 'custom-class-name',
    sx: {},
};

export default defaultArgs;
