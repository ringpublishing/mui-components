import { useEffect, useRef } from 'react';
import { MediaGridApi } from './gridApi.js';

export function useVirtualRowsSync(apiRef: MediaGridApi, resolvedColumns: number): void {
    const columnsRef = useRef(resolvedColumns);
    columnsRef.current = resolvedColumns;

    useEffect(() => {
        apiRef.current!.setColumnsRef(() => columnsRef.current);
        apiRef.current!.publishEvent('columnsChange', {
            columns: resolvedColumns,
        });
    }, [resolvedColumns, apiRef]);
}
