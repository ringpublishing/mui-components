import { ButtonProps, useTheme } from '@mui/material';
import type { StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Placeholder, type PlaceholderProps } from '../../../../../src/index.js';
import { createCodeStory } from '../../../../helpers.js';
import CustomIcon from '../CustomIcon.svg';
import WithButtonsCustomIconAndCustomLabelsExampleCode from './code/WithButtonsCustomIconAndCustomLabelsExample.tsx?raw';

const labelsEnUS = {
    header: 'Failed to load the list',
    description: 'Refresh the page and try again. If the problem persists, please contact our technical support.',
    footer: 'Error 4009',
};

const labelsPlPL = {
    header: 'Nie udało się pobrać listy',
    description:
        'Odśwież stronę i spróbuj ponownie. Jeśli problem się powtarza, skontaktuj się z naszym wsparciem technicznym.',
    footer: 'Błąd 4009',
};

const buttonsPlPL: ButtonProps[] = [
    {
        children: 'Spróbuj ponownie',
        variant: 'outlined',
    },
    {
        children: 'Zamknij',
        variant: 'contained',
        color: 'primary',
    },
];

const buttonsEnUS: ButtonProps[] = [
    {
        children: 'Try again',
        variant: 'outlined',
    },
    {
        children: 'Close',
        variant: 'contained',
        color: 'primary',
    },
];

type Story = StoryObj<typeof Placeholder>;

const Example = (args: PlaceholderProps): React.JSX.Element => {
    const theme = useTheme();
    const labels = theme.locale === 'plPL' ? labelsPlPL : (args.labels ?? labelsEnUS);

    return <Placeholder {...args} labels={labels} buttons={theme.locale === 'plPL' ? buttonsPlPL : buttonsEnUS} />;
};

export const WithButtonsCustomIconAndCustomLabels: Story = {
    args: {
        labels: labelsEnUS,
        img: <img src={CustomIcon} alt="icon" />,
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customCode: WithButtonsCustomIconAndCustomLabelsExampleCode,
            example: <Example {...args} />,
        });
    },
};
