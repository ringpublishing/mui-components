import { Chip, Stack, Tooltip } from '@mui/material';

const LABEL = 'c3f1a9d2-7b4e-4f8a-9c6d-2e1b5a7f9d3c';

export default function LongLabelsExample(): React.JSX.Element {
    // The label is truncated by the chip's width; the delete glyph keeps its full size.
    // A truncated label always carries its full text in a tooltip.
    return (
        <Stack spacing={1} alignItems="flex-start">
            <Tooltip title={LABEL}>
                <Chip label={LABEL} variant="outlined" onDelete={(): void => undefined} sx={{ maxWidth: 160 }} />
            </Tooltip>
            <Tooltip title={LABEL}>
                <Chip label={LABEL} size="medium" onDelete={(): void => undefined} sx={{ maxWidth: 160 }} />
            </Tooltip>
        </Stack>
    );
}
