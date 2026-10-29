import { Chip, Stack, Tooltip, Typography } from '@mui/material';
import { Autocomplete } from '@ringpublishing/mui-components';

interface Option {
    label: string;
    id: number;
    ai?: boolean;
}

const options: Option[] = [
    { label: 'Onet', id: 1 },
    { label: 'Fakt', id: 2 },
    { label: 'Komputer świat', id: 3 },
    { label: 'Newsweek', id: 4 },
    { label: 'Forbes', id: 5, ai: true },
    { label: 'Business insider', id: 6 },
];

export default function AutocompleteExample(): React.JSX.Element {
    return (
        <Stack spacing={4} sx={{ width: 320 }}>
            {/* Every chip: options carry no colour of their own, so the colour
                goes through `slotProps.chip`. */}
            <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                    Every selected chip
                </Typography>
                <Autocomplete
                    options={options}
                    defaultValue={[options[0], options[1]]}
                    multiple={true}
                    labels={{ title: 'search by' }}
                    slotProps={{ chip: { color: 'ai' } }}
                />
            </Stack>

            {/* One option only: `renderValue` replaces the default renderer, so
                `getItemProps` (which carries the delete handler) and the tooltip
                have to be passed on by hand. `renderOption` does the same for
                the dropdown list. */}
            <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                    One flagged option
                </Typography>
                <Autocomplete
                    options={options}
                    defaultValue={[options[0], options[4]]}
                    multiple={true}
                    labels={{ title: 'search by' }}
                    renderValue={(value, getItemProps): React.ReactNode =>
                        (value as Option[]).map((option, index) => {
                            const { key, ...itemProps } = getItemProps({ index }) as ReturnType<typeof getItemProps> & {
                                key?: React.Key;
                            };

                            return (
                                <Tooltip key={key ?? index} title={option.label}>
                                    <Chip label={option.label} color={option.ai ? 'ai' : undefined} {...itemProps} />
                                </Tooltip>
                            );
                        })
                    }
                    renderOption={(props, option): React.ReactNode => {
                        const { key, ...liProps } = props as typeof props & { key?: React.Key };
                        const mediaOption = option as Option;

                        return (
                            <li key={key ?? mediaOption.id} {...liProps}>
                                {mediaOption.ai ? (
                                    <Chip color="ai" label={mediaOption.label} size="small" />
                                ) : (
                                    mediaOption.label
                                )}
                            </li>
                        );
                    }}
                />
            </Stack>
        </Stack>
    );
}
