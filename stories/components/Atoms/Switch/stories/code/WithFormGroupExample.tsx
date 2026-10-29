import { FormControl, FormControlLabel, FormGroup, FormHelperText, FormLabel } from '@mui/material';
import { Switch } from '@ringpublishing/mui-components';

export default function WithFormGroupExample(): React.JSX.Element {
    return (
        <FormControl component="fieldset" variant="standard">
            <FormLabel component="legend">Assign responsibility</FormLabel>
            <FormGroup>
                <FormControlLabel control={<Switch defaultChecked={true} />} label="Gilad Gray" />
                <FormControlLabel control={<Switch />} label="Jason Killian" />
                <FormControlLabel control={<Switch />} label="Antoine Llorca" />
            </FormGroup>
            <FormHelperText>Be careful</FormHelperText>
        </FormControl>
    );
}
