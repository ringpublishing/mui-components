import React from 'react';
import { DatePicker } from '@ringpublishing/mui-components';
import dayjs from 'dayjs';

export default function DefaultValueExample(): React.JSX.Element {
    return <DatePicker defaultValue={dayjs()} />;
}
