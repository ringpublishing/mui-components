import React from 'react';
import { Detail } from '@ringpublishing/mui-components';
import { Box } from '@mui/material';

export default function EmptyStateCustomLabelsExample(): React.JSX.Element {
    return (
        <Box display={'flex'} justifyContent={'center'} height={600}>
            <Detail
                empty={true}
                placeholderLabels={{
                    empty: {
                        header: 'No item selected',
                        description: 'Choose one of the entries from the list to inspect its details.',
                        footer: 'Need help? Contact your administrator.',
                    },
                }}
            />
        </Box>
    );
}
