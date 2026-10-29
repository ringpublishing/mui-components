import React from 'react';
import { CopyIconButton, Detail, DetailDescriptionItemFieldLayout } from '@ringpublishing/mui-components';

const OPEN_RSS = 'https://rss.example.com/0ebeedf7-aebc-4f09-8888-37715df857c0.3f2a9c1e5b7d4a6f8e0c2b4d6f8a1c3e.xml';
const PREMIUM_RSS = 'https://rss.example.com/0ebeedf7-aebc-4f09-8888-37715df857c0.9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e.xml';
const PREVIEW_URL = 'https://preview.example.com/set/0ebeedf7-aebc-4f09-8888-37715df857c0';

export default function WithLongUrlExample(): React.JSX.Element {
    return (
        <Detail
            main={{ title: 'Podcast' }}
            descriptionItems={[
                {
                    sectionTitle: 'RSS feeds — wrapped',
                    fields: [
                        {
                            name: 'Open RSS',
                            value: OPEN_RSS,
                            url: OPEN_RSS,
                            icon: <CopyIconButton size="small" value={OPEN_RSS} />,
                            layout: DetailDescriptionItemFieldLayout.VERTICAL,
                        },
                        {
                            name: 'Premium RSS',
                            value: PREMIUM_RSS,
                            url: PREMIUM_RSS,
                            icon: <CopyIconButton size="small" value={PREMIUM_RSS} />,
                            layout: DetailDescriptionItemFieldLayout.VERTICAL,
                        },
                    ],
                },
                {
                    sectionTitle: 'Preview data — one line',
                    fields: [
                        {
                            name: 'URL',
                            value: PREVIEW_URL,
                            url: PREVIEW_URL,
                            truncate: 'middle',
                            icon: <CopyIconButton size="small" value={PREVIEW_URL} />,
                            layout: DetailDescriptionItemFieldLayout.VERTICAL,
                        },
                        {
                            name: 'Open RSS',
                            value: OPEN_RSS,
                            url: OPEN_RSS,
                            truncate: 'middle',
                            icon: <CopyIconButton size="small" value={OPEN_RSS} />,
                            layout: DetailDescriptionItemFieldLayout.VERTICAL,
                        },
                    ],
                },
            ]}
        />
    );
}
