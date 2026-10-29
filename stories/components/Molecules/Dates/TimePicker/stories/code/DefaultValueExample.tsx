import React from 'react';
import { TimePicker } from '@ringpublishing/mui-components';
import dayjs from 'dayjs';

export default function DefaultValueExample(): React.JSX.Element {
    return <TimePicker defaultValue={dayjs()} />;
}
