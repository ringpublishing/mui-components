import { FormControl, FormControlLabel, FormGroup, FormHelperText, FormLabel } from '@mui/material';
import type { StoryObj } from '@storybook/react-vite';
import { Switch } from '../../../../../src/index.js';

import { createCodeStory } from '../../../../helpers.js';
import WithFormGroupExampleCode from './code/WithFormGroupExample.tsx?raw';

type Story = StoryObj<typeof Switch>;

const Example = (args: React.ComponentProps<typeof Switch>): React.JSX.Element => {
    return (
        <FormControl component="fieldset" variant="standard">
            <FormLabel component="legend">Assign responsibility</FormLabel>
            <FormGroup>
                <FormControlLabel control={<Switch {...args} defaultChecked={true} />} label="Gilad Gray" />
                <FormControlLabel control={<Switch {...args} />} label="Jason Killian" />
                <FormControlLabel control={<Switch {...args} />} label="Antoine Llorca" />
            </FormGroup>
            <FormHelperText>Be careful</FormHelperText>
        </FormControl>
    );
};

export const WithFormGroup: Story = {
    args: {},
    parameters: {
        controls: {
            disable: true,
        },
    },
    render: (args, context) => {
        return createCodeStory({
            context,
            customProps: {},
            customCode: WithFormGroupExampleCode,
            example: <Example {...args} />,
        });
    },
};
