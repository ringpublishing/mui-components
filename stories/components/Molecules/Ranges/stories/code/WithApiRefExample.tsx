import React, { useRef } from 'react';
import { Box, Button } from '@mui/material';
import { Ranges, RangeDefinitions, RangesLabels, RangesApiRef } from '@ringpublishing/mui-components';

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

export default function WithApiRefExample(): React.JSX.Element {
    const apiRef = useRef<RangesApiRef>(null);

    return (
        <Box display="flex" justifyContent="center" minHeight="300px">
            <Box width="200px">
                <Button sx={{ marginBottom: '8px' }} onClick={() => apiRef.current?.resetRanges()}>
                    Reset Ranges
                </Button>
                <Ranges
                    rangeDefinitions={rangeDefinitions}
                    maxAppliedRanges={2}
                    labels={labels}
                    onChange={(ranges) => console.log(ranges)}
                    apiRef={apiRef}
                />
            </Box>
        </Box>
    );
}
