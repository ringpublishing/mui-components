import { Stack } from '@mui/material';
import { Switch } from '@ringpublishing/mui-components';

export default function ColorsExample(): React.JSX.Element {
    return (
        <Stack direction="row" spacing={2} alignItems="center">
            <Switch color="primary" defaultChecked={true} />
            <Switch color="primary" />
            <Switch color="error" defaultChecked={true} />
            <Switch color="error" />
        </Stack>
    );
}
