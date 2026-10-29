import React from 'react';
import { RingDataGrid } from '@ringpublishing/mui-components';
import { dataGridRowsGenerator, columnsForDataGridRowsGenerator } from 'RingDataGridHelpers';

export default function DefaultExample(): React.JSX.Element {
    const rows = dataGridRowsGenerator(10, 0, false);

    return (
        <div style={{ minWidth: '100%', width: '100%', padding: '20px', height: '600px' }}>
            <RingDataGrid columns={columnsForDataGridRowsGenerator} rows={rows} totalRowCount={rows.length} />
        </div>
    );
}
