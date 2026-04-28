import React, { ChangeEvent, useState } from 'react';
import { TextField } from '@ringpublishing/mui-components';
import { ClearOutlined } from '@mui/icons-material';

export default function ControlledExample(): React.JSX.Element {
    const [value, setValue] = useState('');

    function handleOnChange(event: ChangeEvent<HTMLInputElement>): void {
        setValue(event.target.value);
    }

    return (
        <TextField
            label="Search"
            value={value}
            onChange={handleOnChange}
            sx={{ minWidth: '180px' }}
            actions={
                value
                    ? [
                          {
                              icon: <ClearOutlined />,
                              onClick: () => setValue(''),
                              label: 'Clear',
                          },
                      ]
                    : []
            }
        />
    );
}
