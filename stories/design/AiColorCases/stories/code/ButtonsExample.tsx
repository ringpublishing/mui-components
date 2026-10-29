import { Button, Stack } from '@mui/material';
import { Sparkles } from 'lucide-react';
import { RingLucideIcon } from '@ringpublishing/mui-components';

export default function ButtonsExample(): React.JSX.Element {
    return (
        <Stack direction="row" spacing={2} alignItems="center">
            <Button
                color="ai"
                variant="outlined"
                size="small"
                startIcon={<RingLucideIcon icon={Sparkles} color="ai" />}
            >
                Button
            </Button>
            <Button color="ai" variant="outlined" startIcon={<RingLucideIcon icon={Sparkles} color="ai" />}>
                Button
            </Button>
            <Button
                color="ai"
                variant="outlined"
                size="large"
                startIcon={<RingLucideIcon icon={Sparkles} color="ai" />}
            >
                Button
            </Button>
            <Button
                color="ai"
                variant="outlined"
                disabled={true}
                startIcon={<RingLucideIcon icon={Sparkles} color="ai" />}
            >
                Disabled
            </Button>
        </Stack>
    );
}
