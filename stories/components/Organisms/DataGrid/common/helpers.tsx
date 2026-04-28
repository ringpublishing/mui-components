import { v4 as uuidv4 } from 'uuid';
import { GridColDef } from '@mui/x-data-grid-pro';

type DataGridRowExample = {
    id: string | number;
    title: string;
    publicationDate: Date;
    createdDate: Date;
};

export function dataGridRowsGenerator(amount: number, startingNumber = 0, uuidAsId = true): DataGridRowExample[] {
    const result = [];

    for (let i = 0; i < amount; i++) {
        result.push({
            id: uuidAsId ? uuidv4() : i,
            title: `Item ${startingNumber + i}`,
            publicationDate: randomDate(),
            createdDate: randomDate(),
        });
    }

    return result;
}

function randomDate(): Date {
    return new Date(new Date().getTime() - Math.random() * 1e12);
}

export const columnsForDataGridRowsGenerator: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 100, display: 'flex' as const },
    { field: 'title', headerName: 'Title', width: 300, display: 'flex' as const },
    { field: 'publicationDate', headerName: 'Publication', width: 200, display: 'flex' as const, type: 'dateTime' },
    { field: 'createdDate', headerName: 'Created', width: 200, display: 'flex' as const, type: 'date' },
];
