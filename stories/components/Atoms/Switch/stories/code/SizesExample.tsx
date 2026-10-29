import { Stack } from '@mui/material';
import { Switch } from '@ringpublishing/mui-components';

export default function SizesExample(): React.JSX.Element {
    return (
        <Stack direction="row" spacing={2} alignItems="center">
            <Switch size="medium" defaultChecked={true} />
            <Switch size="small" defaultChecked={true} />
        </Stack>
    );
}
