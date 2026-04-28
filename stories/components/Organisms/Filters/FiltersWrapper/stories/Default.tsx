import { useState, ReactElement, ChangeEvent } from 'react';
import type { StoryObj } from '@storybook/react-vite';
import {
    Autocomplete as MuiAutocomplete,
    Checkbox,
    FormControlLabel,
    MenuItem,
    Radio,
    RadioGroup,
    Select,
    Slider,
    Switch,
    TextField,
    SelectChangeEvent,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers-pro';
import { AdapterDayjs } from '@mui/x-date-pickers-pro/AdapterDayjs';
import { action } from 'storybook/actions';
import { Settings } from '@mui/icons-material';
import { createCodeStory } from '../../../../../helpers.js';
import DefaultExampleCode from './code/DefaultExample.tsx?raw';
import {
    Autocomplete,
    Accordion,
    FiltersWrapper,
    FiltersWrapperProps,
    DatePicker,
} from '../../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof FiltersWrapper>;

function FiltersWrapperHandler(args: FiltersWrapperProps): ReactElement {
    const emptyFilters = {
        basicDatePicker: null,
        text: '',
        text2: '',
        checkbox: false,
        switch: false,
        radio: '',
        select: '',
        slider: 0,
        autocomplete: null,
        autocomplete2: [] as { label: string; id: number }[],
        custom: '',
    };
    const [filters, setFilters] = useState(emptyFilters);

    function handleOnClear(): void {
        setFilters(emptyFilters);
        action('onClear')();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function onChange(fieldName: string, value: any): void {
        setFilters({ ...filters, [fieldName]: value });
        action('onChange')(fieldName, value);
    }

    const options = [
        { label: 'Onet', id: 1 },
        { label: 'Fakt', id: 2 },
        { label: 'Komputer swiat', id: 3 },
        { label: 'Newsweek', id: 4 },
        { label: 'Forbes', id: 5 },
        { label: 'Business insider', id: 6 },
    ];

    return (
        <FiltersWrapper {...args} onClear={handleOnClear}>
            <Accordion label="Basic" defaultExpanded={true}>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={'en'}>
                    <DatePicker
                        onChange={(value): void => onChange('basicDatePicker', value)}
                        label="Basic date picker"
                        value={filters.basicDatePicker}
                    />
                </LocalizationProvider>

                <TextField
                    label={'Text'}
                    value={filters.text}
                    onChange={(event: ChangeEvent<HTMLInputElement>): void => onChange('text', event.target.value)}
                />
                <TextField
                    sx={{ marginTop: 1 }}
                    label={'Text2'}
                    value={filters.text2}
                    onChange={(event: ChangeEvent<HTMLInputElement>): void => onChange('text2', event.target.value)}
                />

                <FormControlLabel
                    label="Checkbox"
                    control={
                        <Checkbox
                            onChange={(event): void => onChange('checkbox', event.target.checked)}
                            checked={filters.checkbox}
                        />
                    }
                />
                <FormControlLabel
                    label="Switch"
                    control={
                        <Switch
                            onChange={(event): void => onChange('switch', event.target.checked)}
                            checked={filters.switch}
                        />
                    }
                />

                <Autocomplete
                    labels={{ title: 'Autocomplete2' }}
                    options={options}
                    actions={[
                        {
                            onClick: (): null => null,
                            label: 'Settings',
                            icon: <Settings />,
                        },
                    ]}
                    onChange={(event, value): void => onChange('autocomplete2', value)}
                    multiple={true}
                    value={filters.autocomplete2}
                />

                <MuiAutocomplete
                    options={options}
                    value={filters.autocomplete}
                    onChange={(event, value): void => onChange('autocomplete', value)}
                    renderInput={(params): ReactElement => <TextField {...params} label="Autocomplete" />}
                />
            </Accordion>

            <Accordion label="Radio">
                <RadioGroup
                    onChange={(event): void => onChange('radio', (event.target as HTMLInputElement).value)}
                    value={filters.radio}
                >
                    <FormControlLabel value="opt1" control={<Radio />} label="Option 1" />
                    <FormControlLabel value="opt2" control={<Radio />} label="Option 2" />
                </RadioGroup>
            </Accordion>

            <Accordion label="Select">
                <FormControlLabel
                    control={
                        <Select
                            onChange={(event: SelectChangeEvent<typeof filters.select>): void =>
                                onChange('select', event.target.value)
                            }
                            value={filters.select}
                        >
                            <MenuItem value={10}>Ten</MenuItem>
                            <MenuItem value={20}>Twenty</MenuItem>
                            <MenuItem value={30}>Thirty</MenuItem>
                        </Select>
                    }
                    label="units"
                />
            </Accordion>

            <Accordion label="Slider">
                <Slider
                    valueLabelDisplay="auto"
                    max={10}
                    step={1}
                    value={filters.slider}
                    onChange={(event, value): void => onChange('slider', value)}
                />
            </Accordion>

            <Accordion label="Custom">
                <input onChange={(event): void => onChange('custom', event.target.value)} value={filters.custom} />
            </Accordion>
        </FiltersWrapper>
    );
}

export const Default: Story = {
    args: {
        ...defaultArgs,
        onClear: action('onClear'),
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: args,
            customCode: DefaultExampleCode,
            example: <FiltersWrapperHandler {...args} />,
        }),
};
