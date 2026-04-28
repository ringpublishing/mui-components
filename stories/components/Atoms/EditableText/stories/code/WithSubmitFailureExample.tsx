import React from 'react';
import { EditableText } from '@ringpublishing/mui-components';
import { Box } from '@mui/material';

export default function WithSubmitFailureExample(): React.JSX.Element {
    const handleSubmit = (_value: string): Promise<boolean> => {
        // Simulate a failed submission — text will revert to the previous value
        return Promise.resolve(false);
    };

    return (
        <Box sx={{ width: 300 }}>
            <EditableText
                text="Try editing me, changes will not be saved"
                onSubmit={handleSubmit}
                slotProps={{
                    textField: {
                        fullWidth: true,
                    },
                }}
            />
        </Box>
    );
}
