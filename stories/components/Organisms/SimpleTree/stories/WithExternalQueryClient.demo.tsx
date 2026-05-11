import React, { useEffect, useState } from 'react';
import { action } from 'storybook/actions';
import { QueryClient } from '@tanstack/react-query';
import { SimpleTree } from '../../../../../src/index.js';

function makeClient(): QueryClient {
    return new QueryClient({ defaultOptions: { queries: { staleTime: Infinity, retry: false } } });
}

const debugBtnStyle: React.CSSProperties = {
    padding: '2px 10px',
    fontSize: 11,
    fontFamily: 'monospace',
    background: 'transparent',
    border: '1px solid #6c7086',
    color: '#cdd6f4',
    cursor: 'pointer',
};

export default function WithExternalQueryClientDemo(args: React.ComponentProps<typeof SimpleTree>): React.JSX.Element {
    const [queryClient, setQueryClient] = useState(makeClient);
    const [cacheCount, setCacheCount] = useState(0);

    useEffect(() => {
        const update = (): void => setCacheCount(queryClient.getQueryCache().getAll().length);
        update();

        return queryClient.getQueryCache().subscribe(update);
    }, [queryClient]);

    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 10px',
                    marginBottom: 8,
                    background: '#1e1e2e',
                    fontSize: 12,
                    fontFamily: 'monospace',
                    color: '#cdd6f4',
                }}
            >
                <span style={{ marginRight: 'auto', opacity: 0.7 }}>
                    QueryClient debug &mdash; cached queries: <strong>{cacheCount}</strong>
                </span>
                <button
                    onClick={(): void => {
                        void queryClient.invalidateQueries();
                        action('invalidate all')();
                    }}
                    style={debugBtnStyle}
                    title="Mark all cached queries as stale — they will refetch on next use"
                >
                    Invalidate all
                </button>
                <button
                    onClick={(): void => {
                        queryClient.clear();
                        action('clear cache')();
                    }}
                    style={debugBtnStyle}
                    title="Remove all queries from the cache"
                >
                    Clear cache
                </button>
                <button
                    onClick={(): void => {
                        queryClient.clear();
                        setQueryClient(makeClient());
                        action('reset client')();
                    }}
                    style={{ ...debugBtnStyle, borderColor: '#f38ba8', color: '#f38ba8' }}
                    title="Destroy the current QueryClient and create a fresh one"
                >
                    Reset client
                </button>
            </div>
            <SimpleTree
                {...args}
                queryClient={queryClient}
                onExpand={(itemId): void => {
                    action('row expanded')(itemId);
                }}
                onClickRow={(itemId): void => {
                    action('row clicked')(itemId);
                }}
            />
        </div>
    );
}
