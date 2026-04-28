import React from 'react';
import { Box, Button } from '@mui/material';

interface FileActionSlotProps {
    label: string;
    onClick: () => void;
    dataTestId?: string;
}

export const FileActionSlot: React.FC<FileActionSlotProps> = ({ label, onClick, dataTestId }) => {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button data-testid={dataTestId} variant="text" onClick={onClick} sx={{ textTransform: 'none' }}>
                {label}
            </Button>
        </Box>
    );
};
