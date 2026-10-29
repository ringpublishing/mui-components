import { Chip, Stack } from '@mui/material';
import { LockOpen } from 'lucide-react';
import { Tooltip } from '@ringpublishing/mui-components';

const OWNER = 'This resource is locked by J. Zatrzymałowski';
const LONG = 'A label far longer than the chip, truncated by maxWidth';

export default function WithTooltipExample(): React.JSX.Element {
    const noop = (): void => undefined;

    // The Ring Tooltip: themed, with the arrow, a caption-sized title and an optional subtitle.
    // A chip takes it like any other element. Two uses: extra context behind a short label,
    // and the full text behind a label that can be truncated.
    return (
        <Stack direction="row" spacing={2} alignItems="center" useFlexGap={true} flexWrap="wrap">
            <Tooltip title="Locked" subTitle={OWNER} arrow={true}>
                <Chip label="J. Zatrzymałowski" variant="tag" color="error" icon={<LockOpen />} />
            </Tooltip>
            <Tooltip title="Published 2026-10-12, 14:05" arrow={true}>
                <Chip label="Published" variant="tag" color="success" />
            </Tooltip>
            <Tooltip title={LONG} arrow={true}>
                <Chip label={LONG} variant="outlined" onDelete={noop} sx={{ maxWidth: 160 }} />
            </Tooltip>
        </Stack>
    );
}
