import { Chip, Stack } from '@mui/material';
import { Tag } from 'lucide-react';

const TAG_COLORS = ['stone', 'sky', 'azure', 'lavender', 'blush', 'coral', 'peach', 'lemon', 'sage', 'teal'] as const;
const SEMANTIC_COLORS = ['error', 'warning', 'info', 'success'] as const;

export default function TagsExample(): React.JSX.Element {
    return (
        <Stack spacing={2} alignItems="flex-start">
            <Stack direction="row" spacing={1} useFlexGap={true} flexWrap="wrap">
                {TAG_COLORS.map((color) => (
                    <Chip key={color} variant="tag" color={color} label={color} />
                ))}
            </Stack>
            <Stack direction="row" spacing={1} useFlexGap={true} flexWrap="wrap">
                {SEMANTIC_COLORS.map((color) => (
                    <Chip key={color} variant="tag" color={color} label={color} />
                ))}
                <Chip variant="tag" color="ai" label="ai" />
                <Chip variant="tag" color="neutral" label="neutral" />
                <Chip variant="tag" label="default = neutral" />
            </Stack>
            {/* Icon and delete glyph take the tag's text colour. */}
            <Stack direction="row" spacing={1} useFlexGap={true} flexWrap="wrap">
                <Chip variant="tag" color="stone" label="With icon" icon={<Tag />} />
                <Chip variant="tag" color="teal" label="Deletable" onDelete={(): void => undefined} />
                <Chip variant="tag" color="lavender" label="medium is ignored" size="medium" />
            </Stack>
        </Stack>
    );
}
