// The react-hook-form recipe is shown as code only: the library does not depend on react-hook-form.
export const RECIPIENTS_FORM_AFTER = `import { Controller, useForm } from 'react-hook-form';
import { Autocomplete } from '@ringpublishing/mui-components';

<Controller
    name="recipients"
    control={control}
    rules={{ validate: (value) => value.length > 0 || 'Add at least one recipient' }}
    render={({ field, fieldState }) => (
        <Autocomplete
            variant="chipsInput"
            labels={{ title: 'Recipients *', inputPlaceholder: 'Enter an email address and press Enter' }}
            validateEntry={(entry) => isEmail(String(entry))}
            value={field.value}
            onChange={(event, value) => field.onChange(value)}
            onBlur={field.onBlur}
            disabled={field.disabled}
            slotProps={{
                textField: {
                    inputRef: field.ref,
                    error: Boolean(fieldState.error),
                    helperText: fieldState.error?.message,
                },
            }}
        />
    )}
/>;`;
