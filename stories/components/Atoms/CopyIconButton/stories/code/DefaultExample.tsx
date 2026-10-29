import React from 'react';
import { CopyIconButton } from '@ringpublishing/mui-components';

export default function DefaultExample(): React.JSX.Element {
    return (
        <CopyIconButton
            value="https://rss.example.com/0ebeedf7-aebc-4f09-8888-37715df857c0.3f2a9c1e5b7d4a6f8e0c2b4d6f8a1c3e.xml"
            labels={{ copy: 'Copy', copied: 'Copied' }}
            copiedForMs={1500}
        />
    );
}
