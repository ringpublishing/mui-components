import React, { useEffect, useRef, useState } from 'react';
import { Box, ButtonBase, Chip, ChipProps, Stack, styled, Typography } from '@mui/material';
import { Close, KeyboardArrowUp } from '@mui/icons-material';
import classNames from 'classnames';

import { CommonComponentProps } from '../../../helpers/commonTypes.js';
import { Action } from '../../../types.js';
import { ActionBox } from '../../Molecules/ActionBox/ActionBox.js';
import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';
import { tv } from '../../../helpers/typographyMode.js';

const ChipsGroupContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
    overflow: 'hidden',
    width: '100%',
    alignItems: 'center',
}));

export interface ChipsGroupProps extends CommonComponentProps {
    /**
     * An array of ChipProps. Each ChipProps object defines the properties of a chip, such as the label, color, size, and onClick event handler.
     */
    chips: ChipProps[];
    /**
     * Determines whether the chips group can be expanded to show more chips.
     * If true, a button will be displayed that allows the user to expand the chips group.
     * @default false
     */
    expandable?: boolean;
    /**
     * Determines whether the chips group can be collapsed to show fewer chips.
     * If true, after chips group has been expanded button will be displayed that allows the user to collapse the chips group.
     * @default false
     */
    collapsable?: boolean;

    /**
     * If provided, adds a delete all button at the end of the chips group.
     */
    onDeleteAll?: () => void;

    /**
     * Custom labels for the actions in the chips group.
     */
    customLabels?: {
        deleteAll?: string;
        showLess?: string;
    };
}

const DEFAULT_LAST_CHILD_WIDTH = 32; // 32 default value

export function ChipsGroup(props: ChipsGroupProps): React.JSX.Element {
    const {
        expandable = false,
        collapsable = false,
        sx,
        className,
        onDeleteAll,
        customLabels,
        dataTestIdSuffix,
    } = props;
    const [visibleChipsIndexes, setVisibleChipsIndexes] = useState<number[]>([]);
    const [others, setOthers] = useState<number>(0);
    const [expanded, setExpanded] = useState<boolean>(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const showMoreRef = useRef<HTMLDivElement>(null);
    const [chips, setChips] = useState<ChipProps[]>([]);
    const [chipsNotVisible, setChipsNotVisible] = useState<ChipProps[]>([]);
    const [lastChildWidth, setLastChildWidth] = useState<number>(DEFAULT_LAST_CHILD_WIDTH);

    const dataTestId = useRingDataTestId(ChipsGroup.name, dataTestIdSuffix);

    const handleExpand = (): void => {
        setExpanded((n) => !n);
    };

    useEffect(() => {
        setChips(props.chips.filter(({ label }) => Boolean(label)));
    }, [props.chips]);

    useEffect(() => {
        setChipsNotVisible(chips.filter((chips, index) => !visibleChipsIndexes.includes(index)));
    }, [visibleChipsIndexes, props.chips]);

    const renderExpandableChips = (): React.JSX.Element => {
        if (expanded) {
            return (
                <>
                    {chipsNotVisible.map((chipProps, index) => (
                        <Chip {...chipProps} size={'small'} key={`chip-expanded-${index}`} deleteIcon={<Close />} />
                    ))}

                    {collapsable && (
                        <Chip
                            sx={{ borderColor: 'black' }}
                            size="small"
                            variant="outlined"
                            label={customLabels?.showLess ?? 'Show less'}
                            deleteIcon={<KeyboardArrowUp />}
                            onClick={handleExpand}
                            onDelete={handleExpand}
                        />
                    )}
                </>
            );
        }

        return (
            <Chip
                label={`+${others}`}
                data-testid={`${dataTestId}-expandable`}
                size={'small'}
                onClick={handleExpand}
                id="chips-button"
                aria-haspopup="true"
                sx={{
                    border: '1px solid black',
                    visibility: others === 0 ? 'hidden' : 'visible',
                }}
            />
        );
    };

    const renderShowMoreInMenu = (): React.JSX.Element => {
        const chipsActions: Action[] = chipsNotVisible.map((chip) => ({
            label: typeof chip.label === 'string' ? chip.label : '',
            onClick: chip.onClick,
            disabled: !chip.onClick,
        }));

        return (
            <>
                <Chip
                    ref={showMoreRef}
                    data-testid={`${dataTestId}-show-more`}
                    label={`+${others}`}
                    id="chips-button"
                    aria-haspopup="true"
                    size={'small'}
                    sx={{ '&:hover': { cursor: 'pointer' }, border: '1px solid black' }}
                />
                <ActionBox
                    anchorEl={showMoreRef}
                    actions={chipsActions}
                    hasScroll={false}
                    sx={{ '.Mui-disabled': { opacity: '1 !important' } }}
                />
            </>
        );
    };

    const renderDeleteAll = (): React.JSX.Element | null => {
        if (!onDeleteAll || chips.length === 0) {
            return null;
        }

        return (
            <ButtonBase
                data-testid={`${dataTestId}-delete-all`}
                disableRipple={true}
                onClick={(): void => {
                    onDeleteAll();
                    setVisibleChipsIndexes([]);
                    setChips([]);
                    setExpanded(false);
                    setOthers(0);
                }}
            >
                <Stack direction="row" flex={1} alignItems="center" gap="4px">
                    <Close fontSize="small" color="primary" />
                    <Typography color="primary" sx={{ fontSize: tv('0.8125rem') }}>
                        {customLabels?.deleteAll ?? 'Clear'}
                    </Typography>
                </Stack>
            </ButtonBase>
        );
    };

    const renderChips = (): React.JSX.Element[] => {
        return chips.map((chipProps, index) => {
            const visibility = visibleChipsIndexes.indexOf(index) !== -1 ? 'visible' : 'hidden';
            const position = visibleChipsIndexes.indexOf(index) !== -1 ? 'static' : 'fixed';

            return (
                <Chip
                    {...chipProps}
                    key={`chip-${index}`}
                    data-testid={`${dataTestId}-chip-${index}-${position}`}
                    sx={{ ...chipProps.sx, visibility, position }}
                    size={'small'}
                    onDelete={expandable ? chipProps.onDelete : undefined}
                    deleteIcon={expandable ? <Close /> : undefined}
                />
            );
        });
    };

    useEffect(() => {
        setOthers(chips.length - visibleChipsIndexes.length);
    }, [visibleChipsIndexes, chips]);

    useEffect(() => {
        const updateVisibleChips = (): void => {
            const containerWidth = containerRef.current?.offsetWidth ?? 0;
            const childNodes = Array.from(containerRef.current?.childNodes ?? []);

            // last child node can be the show more or expand chip (and its width needs to be considered first because it might overflow)
            const lastIndex = childNodes.length - 1;
            const lastChild = childNodes[lastIndex] as HTMLElement;
            const isButton = lastChild?.id === 'chips-button';

            if (isButton) {
                setLastChildWidth(lastChild.offsetWidth);
            }

            const newVisibleChipsIndexes: number[] = [];
            let totalChipsWidth = isButton ? (childNodes.pop() as HTMLElement).offsetWidth : 0;

            childNodes.forEach((node, index) => {
                const chipWidth = (node as HTMLElement).offsetWidth;
                const gapRight = 8;
                totalChipsWidth += chipWidth + gapRight;

                const allWidth = totalChipsWidth + lastChildWidth;

                if (allWidth <= containerWidth) {
                    newVisibleChipsIndexes.push(index);
                }
            });
            setVisibleChipsIndexes(newVisibleChipsIndexes);
        };

        updateVisibleChips();

        const handleResize = (): void => {
            updateVisibleChips();
        };

        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, [chips]);

    return (
        <ChipsGroupContainer
            ref={containerRef}
            sx={{
                // FIXME: BUG - ripple effect expands into full width of the container
                '.MuiTouchRipple-root': {
                    display: 'none',
                },
                ...sx,
            }}
            className={classNames('ring-chipsgroup', className)}
            data-testid={dataTestId}
        >
            {renderChips()}
            {chipsNotVisible.length ? (expandable ? renderExpandableChips() : renderShowMoreInMenu()) : null}
            {renderDeleteAll()}
        </ChipsGroupContainer>
    );
}
