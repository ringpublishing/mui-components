import React from 'react';
import { AlarmClock } from 'lucide-react';
import { Media } from '@ringpublishing/mui-components';

export default function NoImageUrlExample(): React.JSX.Element {
    return (
        <Media
            sx={{ width: 400 }}
            type="Photo"
            title="A quiet beach in the early morning"
            description="Author / Source"
            ratio="3/2"
            statusLabels={[{ label: 'Label 1', color: 'primary', icon: <AlarmClock /> }]}
        />
    );
}
