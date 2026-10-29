import { Chip, Stack, Tooltip } from '@mui/material';
import { Check, Trash2 } from 'lucide-react';

export default function DeletableExample(): React.JSX.Element {
    const noop = (): void => undefined;

    return (
        <Stack spacing={2} alignItems="flex-start">
            {/* The X is the theme's default delete glyph; nothing is passed. */}
            <Stack direction="row" spacing={2} alignItems="center">
                <Chip label="Chip Outlined" variant="outlined" size="medium" onDelete={noop} />
                <Chip label="Chip Outlined" variant="outlined" onDelete={noop} />
                <Chip label="Chip Filled" variant="filled" onDelete={noop} />
            </Stack>
            {/* Any icon works as the glyph; a selected chip paints it in the accent colour. */}
            <Stack direction="row" spacing={2} alignItems="center">
                <Chip
                    label="Chip Outlined"
                    variant="outlined"
                    size="medium"
                    onDelete={noop}
                    deleteIcon={<Check />}
                    className="Mui-selected"
                    aria-selected={true}
                />
                <Chip label="Chip Outlined" variant="outlined" size="medium" onDelete={noop} deleteIcon={<Trash2 />} />
            </Stack>
            {/* The glyph keeps its box next to a truncated label. A truncated label always comes
                with a tooltip carrying the full text — the ellipsis hides what the user needs. */}
            <Tooltip title="A label far longer than the chip, truncated by maxWidth">
                <Chip
                    label="A label far longer than the chip, truncated by maxWidth"
                    variant="outlined"
                    onDelete={noop}
                    sx={{ maxWidth: 160 }}
                />
            </Tooltip>
        </Stack>
    );
}
