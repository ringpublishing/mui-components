import { Chip, Stack } from '@mui/material';
import { AlertTriangle } from 'lucide-react';

const SEMANTIC_COLORS = ['error', 'warning', 'info', 'success'] as const;

export default function SemanticColorsExample(): React.JSX.Element {
    const noop = (): void => undefined;

    return (
        <Stack spacing={2} alignItems="flex-start">
            <Stack direction="row" spacing={1} useFlexGap={true} flexWrap="wrap">
                {SEMANTIC_COLORS.map((color) => (
                    <Chip key={color} variant="filled" color={color} label={color} />
                ))}
            </Stack>
            {/* Clickable, deletable, with an icon and selected: the states tint the surface. */}
            <Stack direction="row" spacing={1} useFlexGap={true} flexWrap="wrap">
                <Chip variant="filled" color="warning" label="Clickable" onClick={noop} />
                <Chip variant="filled" color="warning" label="Deletable" onDelete={noop} />
                <Chip variant="filled" color="warning" label="With icon" icon={<AlertTriangle />} />
                <Chip
                    variant="filled"
                    color="warning"
                    label="Selected"
                    onClick={noop}
                    className="Mui-selected"
                    aria-pressed={true}
                />
            </Stack>
        </Stack>
    );
}
