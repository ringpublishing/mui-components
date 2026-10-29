import { Avatar, Chip, Stack } from '@mui/material';

export default function DisabledExample(): React.JSX.Element {
    const noop = (): void => undefined;

    return (
        <Stack direction="row" spacing={2} alignItems="center" useFlexGap={true} flexWrap="wrap">
            <Chip label="Outlined" variant="outlined" disabled={true} />
            <Chip label="Filled" variant="filled" disabled={true} />
            <Chip label="Medium" variant="outlined" size="medium" disabled={true} avatar={<Avatar>OP</Avatar>} />
            <Chip label="Deletable" variant="outlined" disabled={true} onDelete={noop} />
            <Chip label="Warning" variant="filled" color="warning" disabled={true} />
            <Chip label="Tag" variant="tag" color="sky" disabled={true} />
        </Stack>
    );
}
