import React from 'react';
import { GridRenderCellParams } from '@mui/x-data-grid';
import { Link, Box } from '@mui/material';
import { useCellDataTestId } from './dataGridTestIdContext.js';

export interface LinkCellProps {
    /**
     * URL to navigate to
     */
    href: string;

    /**
     * Text to display
     * @defaultValue: href
     */
    text?: string;

    /**
     * target
     */
    target?: string;
}

export function renderLinkCell<T extends LinkCellProps>(params: GridRenderCellParams<Array<T>>): React.JSX.Element {
    const {
        value: { href, text = href, target },
    } = params;
    const dataTestId = useCellDataTestId(params.id as string | number, params.field);

    return (
        <>
            <Box sx={{ py: 1, height: '100%', display: 'flex', alignItems: 'center' }}>
                <Link href={href} target={target} data-testid={dataTestId}>
                    {text}
                </Link>
            </Box>
        </>
    );
}
