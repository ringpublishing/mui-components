import { useState } from 'react';
import { Chip, Stack } from '@mui/material';

const FILTERS = ['Photos', 'Videos', 'Audio', 'Documents'];

export default function SelectedExample(): React.JSX.Element {
    const [active, setActive] = useState<string[]>(['Photos']);

    const toggle = (filter: string): void =>
        setActive((current) =>
            current.includes(filter) ? current.filter((item) => item !== filter) : [...current, filter],
        );

    return (
        <Stack spacing={2} alignItems="flex-start">
            {/* A filter chip is a toggle: the class paints the state, `aria-pressed` announces it. */}
            <Stack direction="row" spacing={1}>
                {FILTERS.map((filter) => {
                    const selected = active.includes(filter);

                    return (
                        <Chip
                            key={filter}
                            label={filter}
                            variant="outlined"
                            onClick={(): void => toggle(filter)}
                            className={selected ? 'Mui-selected' : undefined}
                            aria-pressed={selected}
                        />
                    );
                })}
            </Stack>
            {/* The static states, outlined and filled, for reference. */}
            <Stack direction="row" spacing={1}>
                <Chip label="Selected" variant="outlined" className="Mui-selected" aria-pressed={true} />
                <Chip label="Selected" variant="filled" className="Mui-selected" aria-pressed={true} />
                <Chip
                    label="Selected"
                    variant="outlined"
                    size="medium"
                    className="Mui-selected"
                    aria-pressed={true}
                    onDelete={(): void => undefined}
                />
            </Stack>
        </Stack>
    );
}
