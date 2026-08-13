import { Article, CalendarMonth, OpenInNew, People, Verified } from '@mui/icons-material';
import { Box, Button, Chip, ClickAwayListener, Divider, Paper, Popper, Stack, Typography } from '@mui/material';
import { Autocomplete } from '../../../../../src/index.js';
import React from 'react';

interface Option {
    id: number;
    label: string;
    description: string;
    category: string;
    monthlyReaders: string;
    lastPublished: string;
    status: 'Active' | 'Review pending';
}

const options: Option[] = [
    {
        id: 1,
        label: 'Onet',
        description: 'News and information portal covering current events, technology and lifestyle.',
        category: 'General news',
        monthlyReaders: '18.4M',
        lastPublished: 'Today, 09:42',
        status: 'Active',
    },
    {
        id: 2,
        label: 'Fakt',
        description: 'Daily news and opinion portal with a focus on fast, accessible reporting.',
        category: 'Daily news',
        monthlyReaders: '9.8M',
        lastPublished: 'Today, 08:15',
        status: 'Review pending',
    },
    {
        id: 3,
        label: 'Newsweek',
        description: 'Weekly magazine and website with long-form journalism and analysis.',
        category: 'Magazine',
        monthlyReaders: '4.2M',
        lastPublished: 'Yesterday, 17:30',
        status: 'Active',
    },
];

interface OptionChipProps {
    option: Option;
    label: string;
    chipProps: React.ComponentProps<typeof Chip>;
}

function OptionChip({ option, label, chipProps }: OptionChipProps): React.JSX.Element {
    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef<HTMLDivElement>(null);

    return (
        <>
            <Box ref={anchorRef} sx={{ cursor: 'pointer', display: 'inline-flex' }}>
                <Chip {...chipProps} label={label} onClick={(): void => setOpen((currentOpen) => !currentOpen)} />
            </Box>
            <Popper open={open} anchorEl={anchorRef.current} placement="bottom-start">
                <ClickAwayListener onClickAway={(): void => setOpen(false)}>
                    <Paper elevation={4} sx={{ p: 2, width: 360 }}>
                        <Stack spacing={2}>
                            <Box>
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                    <Box>
                                        <Typography variant="h6">{option.label}</Typography>
                                        <Typography color="text.secondary" variant="body2">
                                            {option.category}
                                        </Typography>
                                    </Box>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Verified
                                            color={option.status === 'Active' ? 'success' : 'warning'}
                                            fontSize="small"
                                        />
                                        <Typography variant="caption">{option.status}</Typography>
                                    </Stack>
                                </Stack>
                                <Typography sx={{ mt: 1 }} variant="body2">
                                    {option.description}
                                </Typography>
                            </Box>

                            <Divider />

                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <People color="action" fontSize="small" />
                                    <Box>
                                        <Typography color="text.secondary" variant="caption">
                                            Monthly readers
                                        </Typography>
                                        <Typography variant="body2">{option.monthlyReaders}</Typography>
                                    </Box>
                                </Stack>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Article color="action" fontSize="small" />
                                    <Box>
                                        <Typography color="text.secondary" variant="caption">
                                            Content type
                                        </Typography>
                                        <Typography variant="body2">{option.category}</Typography>
                                    </Box>
                                </Stack>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <CalendarMonth color="action" fontSize="small" />
                                    <Box>
                                        <Typography color="text.secondary" variant="caption">
                                            Last published
                                        </Typography>
                                        <Typography variant="body2">{option.lastPublished}</Typography>
                                    </Box>
                                </Stack>
                            </Box>

                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                <Button size="small" onClick={(): void => setOpen(false)}>
                                    Close
                                </Button>
                                <Button
                                    endIcon={<OpenInNew />}
                                    size="small"
                                    variant="contained"
                                    onClick={(): void => {
                                        window.open('https://www.example.com', '_blank', 'noopener,noreferrer');
                                    }}
                                >
                                    Open portal
                                </Button>
                            </Stack>
                        </Stack>
                    </Paper>
                </ClickAwayListener>
            </Popper>
        </>
    );
}

export default function WithChipDetailsExample(): React.JSX.Element {
    return (
        <Autocomplete<Option>
            options={options}
            defaultValue={[options[0], options[1]]}
            multiple={true}
            labels={{ title: 'Select portals' }}
            renderChip={({ option, label, chipProps }): React.ReactElement => (
                <OptionChip option={option} label={label} chipProps={chipProps} />
            )}
            sx={{ width: 420 }}
        />
    );
}
