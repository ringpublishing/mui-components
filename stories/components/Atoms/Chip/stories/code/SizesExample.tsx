import { Chip, Stack } from '@mui/material';

export default function SizesExample(): React.JSX.Element {
    return (
        <Stack direction="row" spacing={2} alignItems="center">
            <Chip label="Medium" variant="outlined" size="medium" />
            <Chip label="Small" variant="outlined" size="small" />
            <Chip label="Medium" variant="filled" size="medium" />
            <Chip label="Small" variant="filled" size="small" />
        </Stack>
    );
}
