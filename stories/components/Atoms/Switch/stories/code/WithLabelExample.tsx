import { FormControlLabel } from '@mui/material';
import { Switch } from '@ringpublishing/mui-components';

export default function WithLabelExample(): React.JSX.Element {
    return (
        <>
            <FormControlLabel control={<Switch defaultChecked={true} />} label="Label" />
            <FormControlLabel control={<Switch />} label="Disabled" disabled={true} />
        </>
    );
}
