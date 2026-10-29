import { Chip, Stack, Typography } from '@mui/material';

export default function ClickableExample(): React.JSX.Element {
    const noop = (): void => undefined;

    return (
        <Stack spacing={2} alignItems="flex-start">
            {/* Hover, press and keyboard focus (Tab) paint the state fills. */}
            <Stack direction="row" spacing={2} alignItems="center">
                <Chip label="Outlined" variant="outlined" onClick={noop} />
                <Chip label="Filled" variant="filled" onClick={noop} />
                <Chip label="Medium" variant="outlined" size="medium" onClick={noop} />
            </Stack>
            {/* The focus fill, forced with the class MUI sets on keyboard focus. */}
            <Stack direction="row" spacing={2} alignItems="center">
                <Chip label="Focused" variant="outlined" onClick={noop} className="Mui-focusVisible" />
                <Chip label="Focused" variant="filled" onClick={noop} className="Mui-focusVisible" />
                <Typography variant="caption" color="text.secondary">
                    forced with {'className="Mui-focusVisible"'}
                </Typography>
            </Stack>
        </Stack>
    );
}
