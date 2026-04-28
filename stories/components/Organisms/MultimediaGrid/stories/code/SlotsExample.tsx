import React from 'react';
import { Box, Typography, SxProps } from '@mui/material';
import { MultimediaGrid } from '@ringpublishing/mui-components';
import { useMultimediaGridDemoData } from 'RingDemoData';

const CustomMediaCard = ({ context, sx, foo }: { context: any; sx: SxProps; foo: number }) => (
    <Box
        sx={{
            width: context.itemWidth,
            height: context.itemHeight,
            position: 'relative',
            padding: '3px',
            background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 25%, #EC4899 50%, #10B981 75%, #F59E0B 100%)',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            ...sx,
        }}
    >
        <Box
            sx={{
                width: '100%',
                height: '100%',
                backgroundColor: '#FFFFFF',
                borderRadius: 1.5,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2,
            }}
        >
            <Typography
                variant="h5"
                sx={{
                    color: '#6B46C1',
                    fontWeight: 700,
                    textAlign: 'center',
                    mb: 1,
                }}
            >
                {(context.item as { title?: string }).title?.slice(0, 50) || 'Python on the loose'}
            </Typography>
            {context.breakpoint !== 'xs' ? (
                <Typography
                    variant="caption"
                    sx={{
                        color: '#94A3B8',
                        fontSize: '14px',
                        fontWeight: 400,
                    }}
                >
                    Size: {context.itemWidth}x{context.itemHeight}px | foo: {foo}
                </Typography>
            ) : null}
        </Box>
    </Box>
);

export default function SlotsExample(): React.JSX.Element {
    const { items, totalCount, loading } = useMultimediaGridDemoData();

    const slotProps = {
        mediaCard: {
            foo: 42,
            sx: {
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            },
        },
    };

    return (
        <MultimediaGrid
            slots={{
                mediaCard: CustomMediaCard,
            }}
            slotProps={slotProps}
            items={items}
            loading={loading}
            totalRowCount={totalCount}
            showRingToolbar={false}
            columns={{ xs: 2, sm: 3, md: 4, lg: 5 }}
            cellRatio="1/1"
            spacing={2}
            sx={{ width: '100%', height: '80vh' }}
        />
    );
}
