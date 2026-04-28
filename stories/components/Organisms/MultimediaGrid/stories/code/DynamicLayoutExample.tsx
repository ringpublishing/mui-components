import React from 'react';
import { MultimediaGrid } from '@ringpublishing/mui-components';
import { useMultimediaGridDemoData } from 'RingDemoData';

export default function DynamicLayoutExample(): React.JSX.Element {
    const { items } = useMultimediaGridDemoData();

    return (
        <MultimediaGrid
            dynamicLayout={true}
            dynamicCardWidth={260}
            dynamicCardHeight={300}
            showRingToolbar={true}
            spacing={1}
            items={items}
            sx={{ width: '100%', height: '80vh' }}
        />
    );
}
