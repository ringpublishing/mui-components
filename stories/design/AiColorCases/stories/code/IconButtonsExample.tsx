import { IconButton, Stack } from '@mui/material';
import { Sparkles } from 'lucide-react';
import { RingLucideIcon } from '@ringpublishing/mui-components';

export default function IconButtonsExample(): React.JSX.Element {
    return (
        <Stack direction="row" spacing={2} alignItems="center">
            <IconButton color="ai" size="small" aria-label="AI action">
                <RingLucideIcon icon={Sparkles} color="ai" />
            </IconButton>
            <IconButton color="ai" aria-label="AI action">
                <RingLucideIcon icon={Sparkles} color="ai" />
            </IconButton>
            <IconButton color="ai" size="large" aria-label="AI action">
                <RingLucideIcon icon={Sparkles} color="ai" />
            </IconButton>
            <IconButton color="ai" disabled={true} aria-label="AI action">
                <RingLucideIcon icon={Sparkles} color="ai" />
            </IconButton>
        </Stack>
    );
}
