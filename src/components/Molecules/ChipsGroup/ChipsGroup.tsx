import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Box, ButtonBase, Chip, ChipProps, Stack, styled, Typography } from '@mui/material';
import { X, ChevronUp } from 'lucide-react';
import classNames from 'classnames';

import { CommonComponentProps } from '../../../helpers/commonTypes.js';
import { Action } from '../../../types.js';
import { ActionBox } from '../../Molecules/ActionBox/ActionBox.js';
import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';
import { RingLucideIcon } from '../../../helpers/RingLucideIcon.js';
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

const DEFAULT_COUNTER_WIDTH = 32; // 32 default value
const CHIP_GAP = 8;

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
    const [expanded, setExpanded] = useState<boolean>(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const showMoreRef = useRef<HTMLDivElement>(null);
    const [chips, setChips] = useState<ChipProps[]>([]);
    // A ref, not state: only the measurement reads it, and as state it read a stale value.
    const counterWidthRef = useRef<number>(DEFAULT_COUNTER_WIDTH);

    const deleteAllLabel = customLabels?.deleteAll ?? 'Clear';
    const showLessLabel = customLabels?.showLess ?? 'Show less';
    const hasDeleteAll = Boolean(onDeleteAll) && chips.length > 0;

    // Derived, not effect state: as state it lagged a commit behind and flashed "+N".
    const chipsNotVisible = useMemo(
        () => chips.filter((chip, index) => !visibleChipsIndexes.includes(index)),
        [chips, visibleChipsIndexes],
    );
    const others = chipsNotVisible.length;

    const dataTestId = useRingDataTestId('ChipsGroup', dataTestIdSuffix);

    // "+" sits ~1.1px below the digits' optical centre; lift it in em so it scales.
    const counterLabel = (count: number): React.JSX.Element => (
        <>
            <Box component="span" sx={{ position: 'relative', top: '-0.085em' }}>
                +
            </Box>
            {count}
        </>
    );

    // stopPropagation: the group is composed into clickable surfaces (DataGrid
    // rows, cards, list items) — its internal chips must not trigger the parent
    // click handlers on top of their own expand/collapse/menu behavior.
    const handleExpand = (event?: React.SyntheticEvent): void => {
        event?.stopPropagation();
        setExpanded((n) => !n);
    };

    useEffect(() => {
        setChips(props.chips.filter(({ label }) => Boolean(label)));
    }, [props.chips]);

    const renderExpandableChips = (): React.JSX.Element => {
        if (expanded) {
            return (
                <>
                    {chipsNotVisible.map((chipProps, index) => (
                        <Chip {...chipProps} size={'small'} key={`chip-expanded-${index}`} />
                    ))}

                    {collapsable && (
                        <Chip
                            size="small"
                            variant="outlined"
                            label={showLessLabel}
                            deleteIcon={<ChevronUp size="1em" />}
                            onClick={handleExpand}
                            onDelete={handleExpand}
                        />
                    )}
                </>
            );
        }

        return (
            <Chip
                label={counterLabel(others)}
                data-testid={`${dataTestId}-expandable`}
                size={'small'}
                onClick={handleExpand}
                id="chips-button"
                aria-haspopup="true"
                variant={'outlined'}
                sx={{
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
                    label={counterLabel(others)}
                    id="chips-button"
                    aria-haspopup="true"
                    size={'small'}
                    variant={'outlined'}
                    // ActionBox opens via its own native listener on the anchor, so
                    // stopping propagation here only shields the parent surface.
                    onClick={(event): void => event.stopPropagation()}
                    // An onClick makes a Chip a focusable button, and Enter would not open the
                    // menu (the listener waits for a native click) — keep the anchor as it was.
                    clickable={false}
                    sx={{ '&:hover': { cursor: 'pointer' } }}
                />
                <ActionBox
                    anchorEl={showMoreRef}
                    dataTestId={`${dataTestId}-show-more-menu`}
                    actions={chipsActions}
                    sx={{ '.Mui-disabled': { opacity: '1 !important' } }}
                />
            </>
        );
    };

    const renderDeleteAll = (): React.JSX.Element | null => {
        if (!hasDeleteAll) {
            return null;
        }

        return (
            <ButtonBase
                data-testid={`${dataTestId}-delete-all`}
                disableRipple={true}
                onClick={(): void => {
                    onDeleteAll?.();
                    setVisibleChipsIndexes([]);
                    setChips([]);
                    setExpanded(false);
                }}
            >
                <Stack direction="row" flex={1} alignItems="center" gap="4px">
                    <RingLucideIcon icon={X} fontSize="small" color="primary" />
                    <Typography color="primary" sx={{ fontSize: tv('0.8125rem') }}>
                        {deleteAllLabel}
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
                    onDelete={chipProps.onDelete}
                />
            );
        });
    };

    // Layout effect: measuring after paint shows a frame of the unmeasured layout.
    useLayoutEffect(() => {
        const updateVisibleChips = (): void => {
            const container = containerRef.current;
            const containerWidth = container?.offsetWidth ?? 0;
            const childNodes = Array.from(container?.children ?? []) as HTMLElement[];

            // Expanded, the container also holds every hidden chip and the "show less" chip, which
            // break the chips-first split below. Gated on those nodes, not on `expanded` alone, which
            // with nothing hidden would leave the group with no way to collapse.
            const expansionNodes = childNodes.length - chips.length - (hasDeleteAll ? 1 : 0);

            if (expanded && expansionNodes > 0) {
                return;
            }

            // Chip nodes come first; the counter and "clear all" are not chips.
            const chipNodes = childNodes.slice(0, chips.length);
            const trailingNodes = childNodes.slice(chips.length);

            const counterNode = trailingNodes.find((node) => node.id === 'chips-button');
            const clearAllNode = hasDeleteAll ? trailingNodes[trailingNodes.length - 1] : undefined;

            if (counterNode) {
                counterWidthRef.current = counterNode.offsetWidth;
            }

            // The chip loop below already charges a gap after each chip.
            const clearAllWidth = clearAllNode ? clearAllNode.offsetWidth + CHIP_GAP : 0;
            const chipWidths = chipNodes.map((node) => node.offsetWidth);
            const allChipsWidth = chipWidths.reduce((sum, width) => sum + width + CHIP_GAP, 0);

            // Hiding even one chip mounts the counter, so its width has to be reserved while
            // it is still absent from the DOM — last measured width, or the default before that.
            const reservedWidth =
                allChipsWidth + clearAllWidth <= containerWidth
                    ? clearAllWidth
                    : counterWidthRef.current + CHIP_GAP + clearAllWidth;

            const newVisibleChipsIndexes: number[] = [];
            let totalChipsWidth = 0;

            chipWidths.forEach((width, index) => {
                totalChipsWidth += width + CHIP_GAP;

                if (totalChipsWidth + reservedWidth <= containerWidth) {
                    newVisibleChipsIndexes.push(index);
                }
            });

            setVisibleChipsIndexes((current) =>
                current.length === newVisibleChipsIndexes.length &&
                current.every((value, index) => value === newVisibleChipsIndexes[index])
                    ? current
                    : newVisibleChipsIndexes,
            );
        };

        updateVisibleChips();

        const handleResize = (): void => {
            updateVisibleChips();
        };

        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
        // `hasDeleteAll` and `deleteAllLabel` size the trailing nodes the budget reserves,
        // so a change to either has to re-measure.
    }, [chips, expanded, hasDeleteAll, deleteAllLabel]);

    return (
        <ChipsGroupContainer
            ref={containerRef}
            sx={{
                // `renderChips` sets visible chips to `position: static`, so a ripple would spread past
                // the clicked chip.
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
