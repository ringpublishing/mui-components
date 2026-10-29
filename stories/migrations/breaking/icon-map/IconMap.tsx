import React, { useMemo, useState } from 'react';
import { ICON_MAP } from './iconMapData.js';

// Rendered in the MDX itself, outside the story decorators, so it uses plain elements.
const muted = 'rgba(128, 128, 128, 0.9)';
const cell: React.CSSProperties = { padding: '6px 12px', verticalAlign: 'middle' };
const iconCell: React.CSSProperties = { ...cell, textAlign: 'center', width: 1 };

const normalize = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]/g, '');
const strip = (value: string, suffix: RegExp): string => value.replace(suffix, '') || value;

// What people paste: an import path (`@mui/icons-material/Delete`), a local name (`DeleteIcon`) or a style variant
// the map lists only once (`ContentCopyOutlined`); each also searches as the bare icon name.
const searchTerms = (query: string): string[] => {
    const name = normalize(query.slice(query.lastIndexOf('/') + 1));
    const bare = strip(strip(name, /icon$/), /(outlined|rounded|sharp|twotone)$/);

    return name === bare ? [name] : [name, bare];
};

export function IconMap(): React.JSX.Element {
    const [query, setQuery] = useState('');

    const rows = useMemo(() => {
        const terms = searchTerms(query);

        if (!terms[0]) {
            return ICON_MAP;
        }

        return ICON_MAP.filter(({ lucide, material }) =>
            [lucide, ...material].some((name) => terms.some((term) => normalize(name).includes(term))),
        );
    }, [query]);

    return (
        <div>
            <input
                type="search"
                aria-label="Search by a Material or lucide icon name"
                placeholder="Search by a Material or lucide icon name, e.g. DeleteOutline"
                value={query}
                onChange={(event): void => setQuery(event.target.value)}
                style={{
                    border: '1px solid rgba(128, 128, 128, 0.4)',
                    borderRadius: 6,
                    font: 'inherit',
                    padding: '8px 12px',
                    width: '100%',
                }}
            />
            <p role="status" style={{ color: muted, fontSize: 13, margin: '8px 0 0' }}>
                {rows.length} of {ICON_MAP.length} icons
            </p>
            <table style={{ borderCollapse: 'collapse', marginTop: 8, width: '100%' }}>
                <thead>
                    <tr>
                        <th style={iconCell}>Icon</th>
                        <th style={{ ...cell, textAlign: 'left' }}>Replacement</th>
                        <th style={{ ...cell, textAlign: 'left' }}>Material</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map(({ icon: Icon, lucide, from, material }) => (
                        <tr key={lucide}>
                            <td style={iconCell}>
                                <Icon
                                    size={20}
                                    strokeWidth={1.5}
                                    aria-hidden={true}
                                    style={{ display: 'block', margin: '0 auto' }}
                                />
                            </td>
                            <td style={cell}>
                                <code>{lucide}</code>
                                {from && (
                                    <div style={{ color: muted, fontSize: 12 }}>
                                        from <code>{from}</code>
                                    </div>
                                )}
                            </td>
                            <td style={cell}>
                                {material.map((name, index) => (
                                    <React.Fragment key={name}>
                                        {index > 0 && ', '}
                                        <code>{name}</code>
                                    </React.Fragment>
                                ))}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
