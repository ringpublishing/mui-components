import { Box, Skeleton } from '@mui/material';
import React from 'react';

const SIMPLE_ROW_HEIGHT = 18;
const SIMPLE_ROW_MARGIN_BOTTOM = '6px';
const DATA_ROW_HEIGHT = 40;
const DATA_ROW_MARGIN_BOTTOM = '2px';
const CONTAINER_PADDING = '8px';
const ROW_BORDER_RADIUS = '4px';
const ROW_WIDTHS = [180, 140, 200, 120];

interface TreeSkeletonProps {
    variant: 'simple' | 'data';
}

/**
 * Suspense fallback for the lazy `SimpleTreeDynamic` / `DataTreeDynamic`
 * chunks. Shows a few placeholder rows so layout doesn't jump while the
 * dynamic-loading bundle is fetched on first render. Row height matches
 * the corresponding tree's actual row metrics so the layout stays put
 * when the dynamic chunk takes over.
 */
export function TreeSkeleton({ variant }: TreeSkeletonProps): React.JSX.Element {
    const rowHeight = variant === 'data' ? DATA_ROW_HEIGHT : SIMPLE_ROW_HEIGHT;
    const rowMarginBottom = variant === 'data' ? DATA_ROW_MARGIN_BOTTOM : SIMPLE_ROW_MARGIN_BOTTOM;

    return (
        <Box sx={{ padding: CONTAINER_PADDING }}>
            {ROW_WIDTHS.map((width, index) => (
                <Skeleton
                    key={index}
                    variant="rectangular"
                    height={rowHeight}
                    width={width}
                    sx={{
                        borderRadius: ROW_BORDER_RADIUS,
                        marginBottom: index < ROW_WIDTHS.length - 1 ? rowMarginBottom : 0,
                    }}
                />
            ))}
        </Box>
    );
}
