import { Avatar, Chip, ChipProps, Stack, Typography } from '@mui/material';
import { AlertTriangle } from 'lucide-react';

const noop = (): void => undefined;

// Enabled, Disabled, Focused and Selected are forced; Hovered and Pressed are live — hover
// and hold the chips in those columns. Keyboard focus (Tab) paints the same fill as the
// forced `Mui-focusVisible`; a mouse click does not, by MUI design.
const COLUMNS = ['Enabled', 'Hovered', 'Focused', 'Disabled', 'Pressed', 'Selected'] as const;

const stateProps: Record<(typeof COLUMNS)[number], Partial<ChipProps>> = {
    Enabled: {},
    Hovered: { onClick: noop },
    Focused: { onClick: noop, className: 'Mui-focusVisible' },
    Disabled: { disabled: true },
    Pressed: { onClick: noop },
    Selected: { onClick: noop, className: 'Mui-selected', 'aria-pressed': true },
};

const ROWS: { title: string; props: Partial<ChipProps> }[] = [
    { title: 'Outlined · medium', props: { variant: 'outlined', size: 'medium', avatar: <Avatar>OP</Avatar> } },
    { title: 'Outlined · small', props: { variant: 'outlined', size: 'small', avatar: <Avatar>OP</Avatar> } },
    { title: 'Filled · small', props: { variant: 'filled', size: 'small', avatar: <Avatar>OP</Avatar> } },
    {
        title: 'Filled · warning',
        props: { variant: 'filled', size: 'small', color: 'warning', icon: <AlertTriangle /> },
    },
];

export default function StatesExample(): React.JSX.Element {
    return (
        <Stack spacing={1.5}>
            <Stack direction="row" spacing={2}>
                <Typography variant="caption" sx={{ width: 120 }} />
                {COLUMNS.map((column) => (
                    <Typography key={column} variant="caption" color="text.secondary" sx={{ width: 110 }}>
                        {column}
                    </Typography>
                ))}
            </Stack>
            {ROWS.map(({ title, props }) => (
                <Stack key={title} direction="row" spacing={2} alignItems="center">
                    <Typography variant="caption" sx={{ width: 120 }}>
                        {title}
                    </Typography>
                    {COLUMNS.map((column) => (
                        <Stack key={column} sx={{ width: 110 }} alignItems="flex-start">
                            <Chip label="Chip" onDelete={noop} {...props} {...stateProps[column]} />
                        </Stack>
                    ))}
                </Stack>
            ))}
        </Stack>
    );
}
