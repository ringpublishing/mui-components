import { MoreVert, Save, Tune } from '@mui/icons-material';
import type { StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import React, { useCallback, useRef, useState } from 'react';
import { createCodeStory } from '../../../../helpers.js';
import WithMenuListActionExampleCode from './code/WithMenuListActionExample.tsx?raw';
import { ActionBox, ActionBoxItem, Autocomplete, DefaultAutocompleteProps } from '../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';

interface MenuListActionsControl {
    label?: string;
    actions: ReadonlyArray<{
        label: string;
        icon?: React.ReactNode;
        ariaLabel?: string;
        disabled?: boolean;
        disabledReason?: string;
    }>;
}
type StoryArgs = Omit<DefaultAutocompleteProps, 'menuListActions'> & { menuListActions: MenuListActionsControl };
type Story = StoryObj<StoryArgs>;

const tuneIcon = <Tune />;
const moreVertIcon = <MoreVert />;
const saveIcon = <Save />;
const configureResultsAction = action('configure results');
const moreResultsActionsAction = action('more results actions');
const showActiveResultsAction = action('show active results');
const showAllResultsAction = action('show all results');
const menuActions: ActionBoxItem[] = [
    {
        label: 'Show active results',
        icon: tuneIcon,
        onClick: showActiveResultsAction,
    },
    {
        label: 'Show all results',
        onClick: showAllResultsAction,
    },
];

function WithMenuListActionExample(props: StoryArgs): React.JSX.Element {
    const actionBoxAnchorRef = useRef<HTMLButtonElement>(null);
    const [isAnchorMounted, setIsAnchorMounted] = useState(false);
    const { menuListActions, ...autocompleteProps } = props;
    const setAnchorRef = useCallback((element: HTMLButtonElement | null): void => {
        actionBoxAnchorRef.current = element;
        setIsAnchorMounted(Boolean(element));
    }, []);

    return (
        <>
            <Autocomplete
                {...autocompleteProps}
                menuListActions={{
                    label: menuListActions.label,
                    actions: (menuListActions.actions ?? []).map((menuAction, index) => ({
                        ...menuAction,
                        anchorRef: index === 0 ? setAnchorRef : undefined,
                        icon: menuAction.icon,
                        onClick: index === 0 ? configureResultsAction : moreResultsActionsAction,
                    })),
                }}
            />
            {isAnchorMounted && (
                <ActionBox actions={menuActions} anchorEl={actionBoxAnchorRef} placement="bottom-end" zIndex={1400} />
            )}
        </>
    );
}

export const WithMenuListAction: Story = {
    args: {
        ...defaultArgs,
        labels: { title: 'Search by' },
        menuListActions: {
            label: 'Results',
            actions: [
                { label: 'Configure results', icon: tuneIcon },
                { label: 'More results actions', icon: moreVertIcon },
                {
                    label: 'Save results',
                    icon: saveIcon,
                    disabled: true,
                    disabledReason: 'Select a result before saving',
                },
            ],
        },
    },
    render: (args, context) =>
        createCodeStory({
            context,
            customProps: args,
            customCode: WithMenuListActionExampleCode,
            example: <WithMenuListActionExample {...(args as StoryArgs)} />,
        }),
};
