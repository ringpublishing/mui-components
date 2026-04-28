import React from 'react';
import { ButtonProps } from '@mui/material';
import { Placeholder } from '@ringpublishing/mui-components';
import CustomIcon from 'CustomIcon';

const labels = {
    header: 'Failed to load the list',
    description: 'Refresh the page and try again. If the problem persists, please contact our technical support.',
    footer: 'Error 4009',
};

const buttons: ButtonProps[] = [
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

export default function WithButtonsCustomIconAndCustomLabelsExample(): React.JSX.Element {
    const img = <img src={CustomIcon} alt="icon" />;

    return <Placeholder labels={labels} buttons={buttons} img={img} />;
}
