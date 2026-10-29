import { Stack } from '@mui/material';
import { Switch } from '@ringpublishing/mui-components';

export default function DisabledExample(): React.JSX.Element {
    return (
        <Stack direction="row" spacing={2} alignItems="center">
            <Switch disabled={true} defaultChecked={true} />
            <Switch disabled={true} />
        </Stack>
    );
}
