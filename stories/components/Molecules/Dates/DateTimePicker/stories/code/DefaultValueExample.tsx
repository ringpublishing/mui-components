import React from 'react';
import { DateTimePicker } from '@ringpublishing/mui-components';
import dayjs from 'dayjs';

export default function DefaultValueExample(): React.JSX.Element {
    return <DateTimePicker defaultValue={dayjs()} />;
}
