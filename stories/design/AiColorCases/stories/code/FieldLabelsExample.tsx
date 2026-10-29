import { Box, Stack, TextField, type Theme } from '@mui/material';
import { Autocomplete } from '@ringpublishing/mui-components';

function AiMark(): React.JSX.Element {
    return (
        <Box component="span" sx={(theme: Theme): ReturnType<Theme['gradientText']> => theme.gradientText('ai')}>
            (AI)
        </Box>
    );
}

export default function FieldLabelsExample(): React.JSX.Element {
    return (
        <Stack spacing={3} sx={{ width: 320 }}>
            <TextField
                label={
                    <span>
                        Authors <AiMark />
                    </span>
                }
                placeholder="Search authors"
            />
            <Autocomplete
                multiple={true}
                options={['Anna', 'Jan', 'Maria']}
                labels={{
                    title: (
                        <span>
                            Authors <AiMark />
                        </span>
                    ),
                    inputPlaceholder: 'Select authors',
                }}
            />
        </Stack>
    );
}
