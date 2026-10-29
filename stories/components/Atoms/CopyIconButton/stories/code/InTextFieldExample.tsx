import React, { useState } from 'react';
import { InputAdornment } from '@mui/material';
import { CopyIconButton, TextField } from '@ringpublishing/mui-components';

export default function InTextFieldExample(): React.JSX.Element {
    const [value, setValue] = useState('0ebeedf7-aebc-4f09-8888-37715df857c0');

    return (
        <TextField
            label="Identifier (UUID)"
            value={value}
            onChange={(event: React.ChangeEvent<HTMLInputElement>): void => setValue(event.target.value)}
            slotProps={{
                input: {
                    endAdornment: (
                        <InputAdornment position="end">
                            <CopyIconButton value={value} labels={{ copy: 'Copy', copied: 'Copied' }} />
                        </InputAdornment>
                    ),
                },
            }}
        />
    );
}
