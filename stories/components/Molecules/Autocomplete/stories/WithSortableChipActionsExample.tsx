import React, { useState } from 'react';
import { Chip, Tooltip } from '@mui/material';
import { Star } from 'lucide-react';
import { Autocomplete, DEFAULT_LUCIDE_ICON_SIZE } from '../../../../../src/index.js';

interface Option {
    id: number;
    label: string;
}

const portalOptions: Option[] = [
    { id: 1, label: 'Onet' },
    { id: 2, label: 'Fakt' },
    { id: 3, label: 'Auto Świat' },
    { id: 4, label: 'Przegląd Sportowy' },
];

/**
 * `sortableChips` composes with `renderChip`: the custom chip is dragged as-is, and the callback
 * additionally receives `isDragActive` to suppress hover affordances while a drag is in progress.
 */
export function WithSortableChipActionsExample(): React.JSX.Element {
    const [value, setValue] = useState<Option[]>(portalOptions.slice(0, 3));
    const [mainId, setMainId] = useState<number | null>(1);

    return (
        <Autocomplete<Option>
            labels={{ title: 'Portals' }}
            options={portalOptions}
            multiple={true}
            sortableChips={true}
            value={value}
            onChange={(event, newValue): void => setValue(newValue as Option[])}
            sx={{ width: 420 }}
            renderChip={({ option, label, chipProps, isDragActive }): React.ReactNode => (
                <Tooltip title={isDragActive ? '' : `${label} — click the star to set as main`}>
                    <Chip
                        {...chipProps}
                        color={option.id === mainId ? 'primary' : 'default'}
                        icon={
                            <Star
                                size={DEFAULT_LUCIDE_ICON_SIZE}
                                fill={option.id === mainId ? 'currentColor' : 'none'}
                            />
                        }
                        onClick={(): void => setMainId(option.id)}
                    />
                </Tooltip>
            )}
        />
    );
}
