import { Chip, Stack } from '@mui/material';
import { Star } from 'lucide-react';
import { RingLucideIcon } from '@ringpublishing/mui-components';

export default function WithIconExample(): React.JSX.Element {
    return (
        <Stack direction="row" spacing={2} alignItems="center">
            {/* Bare lucide or RingLucideIcon: the slot sizes either one. */}
            <Chip label="With icon" variant="outlined" size="medium" icon={<Star />} />
            <Chip label="With icon" variant="outlined" icon={<RingLucideIcon icon={Star} />} />
            <Chip label="With icon" variant="filled" icon={<Star />} />
            <Chip
                label="With icon"
                variant="outlined"
                size="medium"
                icon={<Star />}
                className="Mui-selected"
                aria-pressed={true}
            />
        </Stack>
    );
}
