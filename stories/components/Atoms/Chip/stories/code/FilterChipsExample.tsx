import { Stack, Typography } from '@mui/material';
import { Autocomplete, ChipsGroup } from '@ringpublishing/mui-components';

interface Option {
    label: string;
    id: number;
}

const options: Option[] = [
    { label: 'Onet', id: 1 },
    { label: 'Fakt', id: 2 },
    { label: 'Komputer świat', id: 3 },
    { label: 'A publisher name long enough to truncate inside the field', id: 4 },
];

export default function FilterChipsExample(): React.JSX.Element {
    const noop = (): void => undefined;

    return (
        <Stack spacing={3} alignItems="flex-start">
            {/* Filter chips: outlined, deletable — the library's own glyph, now the theme's box. */}
            <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                    ChipsGroup
                </Typography>
                <div style={{ width: 320 }}>
                    <ChipsGroup
                        expandable={true}
                        collapsable={true}
                        onDeleteAll={noop}
                        chips={[
                            { label: 'Date from: 2026-01-01', variant: 'outlined', onDelete: noop },
                            { label: 'Status: published', variant: 'outlined', onDelete: noop },
                            { label: 'Owner: J. Doe', variant: 'outlined', onDelete: noop },
                            { label: 'Type: photo', variant: 'outlined', onDelete: noop },
                        ]}
                    />
                </div>
            </Stack>
            {/* Selected values: the long label truncates, the X keeps its 16px. */}
            <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                    Autocomplete
                </Typography>
                <Autocomplete
                    options={options}
                    defaultValue={[options[0], options[3]]}
                    multiple={true}
                    labels={{ title: 'search by' }}
                    sx={{ width: 260 }}
                />
            </Stack>
        </Stack>
    );
}
