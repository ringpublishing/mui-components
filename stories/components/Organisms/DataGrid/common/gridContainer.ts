import type { SxProps, Theme } from '@mui/material';

/**
 * The grid fills the canvas in the story view. A docs page has no height to fill, so a story embedded
 * there keeps a fixed box. A flex column, because RingDataGrid puts its toolbar above the grid and the
 * grid root takes the rest (`flex: 1`) — as a block it is 100% tall and overflows by the toolbar.
 */
export const GRID_CONTAINER_SX: SxProps<Theme> = {
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100vh',
    padding: '20px',
    '.docs-story &': { height: 600 },
};
