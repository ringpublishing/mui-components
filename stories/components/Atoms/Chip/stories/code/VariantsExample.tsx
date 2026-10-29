import { Chip, Stack } from '@mui/material';

export default function VariantsExample(): React.JSX.Element {
    return (
        <Stack direction="row" spacing={2} alignItems="center">
            <Chip label="Outlined" variant="outlined" />
            <Chip label="Filled" variant="filled" />
            <Chip label="Tag" variant="tag" color="sky" />
        </Stack>
    );
}
