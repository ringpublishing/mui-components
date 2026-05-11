import React from 'react';
import { Box } from '@mui/material';
import { Ranges, RangeDefinitions, RangesLabels } from '@ringpublishing/mui-components';

const rangeDefinitions: RangeDefinitions = {
    imagesCount: {
        label: 'Images Count',
        rangeBounds: { min: 0, max: 100 },
    },
    authorsCount: {
        label: 'Authors Count',
        rangeBounds: { min: 1, max: 50 },
    },
    charactersCount: {
        label: 'Characters Count',
        rangeOptions: [
            { value: 1000, label: '1K', order: 0 },
            { value: 5000, label: '5K', order: 1 },
            { value: 10000, label: '10K', order: 2 },
        ],
    },
};

const labels: RangesLabels = {
    rangeSelect: 'Select Metric',
    addRangeButton: 'Add range',
    removeRangeButton: 'Remove',
    rangeSelectPlaceholder: 'Choose metric',
    fromInput: 'From',
    toInput: 'To',
    valueTooHighError: 'Maximum value is ',
    valueTooLowError: 'Minimum value is ',
    valueRequiredError: 'Field is required',
    invalidRangeError: 'Invalid range',
};

export default function WithInitialStateExample(): React.JSX.Element {
    return (
        <Box display="flex" justifyContent="center" minHeight="300px">
            <Box width="200px">
                <Ranges
                    rangeDefinitions={rangeDefinitions}
                    maxAppliedRanges={3}
                    labels={labels}
                    onChange={(ranges) => console.log(ranges)}
                    initialState={{
                        imagesCount: {
                            order: 0,
                            from: 10,
                            to: 50,
                        },
                        charactersCount: {
                            order: 1,
                            from: 1000,
                        },
                    }}
                />
            </Box>
        </Box>
    );
}
