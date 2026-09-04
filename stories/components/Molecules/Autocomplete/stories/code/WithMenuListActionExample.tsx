import { MoreVert, Save, Tune } from '@mui/icons-material';
import React, { useCallback, useRef, useState } from 'react';
import { ActionBox, ActionBoxItem, Autocomplete } from '@ringpublishing/mui-components';

interface Option {
    label: string;
    id: number;
}

export default function WithMenuListActionExample(): React.JSX.Element {
    const actionBoxAnchorRef = useRef<HTMLButtonElement>(null);
    const [isAnchorMounted, setIsAnchorMounted] = useState(false);
    const options: Option[] = [
        { label: 'Onet', id: 1 },
        { label: 'Fakt', id: 2 },
        { label: 'Komputer świat', id: 3 },
        { label: 'Newsweek', id: 4 },
        { label: 'Forbes', id: 5 },
        { label: 'Business insider', id: 6 },
        { label: 'LabelWithVeryLongTextThatShouldBeBreakToNextLine', id: 7 },
    ];
    const menuActions: ActionBoxItem[] = [
        {
            label: 'Show active results',
            icon: <Tune />,
            onClick: (): void => undefined,
        },
        {
            label: 'Show all results',
            onClick: (): void => undefined,
        },
    ];
    const configureResultsAction = (): void => undefined;
    const moreResultsActionsAction = (): void => undefined;
    const setAnchorRef = useCallback((element: HTMLButtonElement | null): void => {
        actionBoxAnchorRef.current = element;
        setIsAnchorMounted(Boolean(element));
    }, []);

    return (
        <>
            <Autocomplete
                options={options}
                labels={{ title: 'Search by' }}
                menuListActions={{
                    label: 'Results',
                    actions: [
                        {
                            label: 'Configure results',
                            icon: <Tune />,
                            anchorRef: setAnchorRef,
                            onClick: configureResultsAction,
                        },
                        {
                            label: 'More results actions',
                            icon: <MoreVert />,
                            onClick: moreResultsActionsAction,
                        },
                        {
                            label: 'Save results',
                            icon: <Save />,
                            disabled: true,
                            disabledReason: 'Select a result before saving',
                            onClick: moreResultsActionsAction,
                        },
                    ],
                }}
                sx={{ width: 300 }}
            />
            {isAnchorMounted && (
                <ActionBox actions={menuActions} anchorEl={actionBoxAnchorRef} placement="bottom-end" zIndex={1400} />
            )}
        </>
    );
}
