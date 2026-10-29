import React, { useRef, useState, useEffect } from 'react';
import { alpha, Box, Link, Typography, useTheme, SxProps } from '@mui/material';
import { CommonComponentProps } from '../../../helpers/commonTypes.js';
import { GetItemDataTestId, WithItemDataTestId, resolveItemDataTestId } from '../../../helpers/dataTestId.js';
import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';

export interface InputDataProps extends WithItemDataTestId {
    /**
     * Header label, visible on both sides
     */
    header: string;
    /**
     * Additional element rendered on left side of component, next to the header
     */
    additionalHeaderData?: React.ReactNode | React.JSX.Element | string;
    /**
     * Children are rendered on the right side of the component under the header
     */
    children: React.ReactNode | React.JSX.Element | string;
    /**
     * Additional element rendered on the right side of the component, next to the header and above children
     */
    contentHeaderAction?: React.ReactNode | React.JSX.Element | string;
    /**
     * Additional content rendered in the content panel, above the item's header.
     */
    beforeHeaderContent?: React.ReactNode | React.JSX.Element | string;

    /**
     * Custom styles for the content box
     */
    itemSx?: SxProps;
}

export interface ContentListProps extends CommonComponentProps {
    /**
     * Input data for the component, it should be an array of objects of type InputDataProps
     */
    inputData: InputDataProps[];
    /**
     * Function called after clicking on the header on the left side
     */
    onHeaderClick?: (item: InputDataProps, index: number) => void;
    /**
     * The index of the selected item
     * @default 0
     */
    selectedItemIndex?: number;
    /**
     * Additional content rendered above the navigation menu in the left column
     */
    listHeader?: React.ReactNode | React.JSX.Element | string;

    /**
     * Custom styles for the content container on the right side
     */
    containerSx?: SxProps;
    /**
     * Overrides the generated `data-testid` per item. Return `undefined` to keep the default
     * `ring-contentlist[-<suffix>]-item-<index>`.
     */
    getItemDataTestId?: GetItemDataTestId<InputDataProps>;
}

export function ContentList({
    inputData,
    selectedItemIndex = 0,
    onHeaderClick,
    listHeader,
    dataTestIdSuffix,
    getItemDataTestId,
    sx,
    className,
    containerSx = {},
}: ContentListProps): React.JSX.Element {
    const contentRefs = useRef<(HTMLElement | null)[]>([]);
    const dataTestId = useRingDataTestId('ContentList', dataTestIdSuffix);
    const itemDataTestId = (item: InputDataProps, index: number): string =>
        resolveItemDataTestId({
            componentName: 'ContentList',
            listSuffix: dataTestIdSuffix,
            index,
            item,
            override: getItemDataTestId?.(item, index),
        });
    const containerRef = useRef<HTMLDivElement | null>(null);
    const containerListRef = useRef<HTMLDivElement | null>(null);
    const navListRef = useRef<HTMLDivElement | null>(null);
    const navItemRefs = useRef<(HTMLElement | null)[]>([]);
    const isInitializedRef = useRef<boolean>(false);
    const [selectedIndex, setSelectedIndex] = useState(selectedItemIndex);
    const [highlight, setHighlight] = useState({ top: 0, height: 0 });

    const theme = useTheme();

    useEffect(() => {
        if (contentRefs.current.length) {
            setSelectedIndex(selectedItemIndex);
        }
    }, [selectedItemIndex]);

    // The highlight is measured off the selected item's own box rather than derived from a fixed
    // row height. A label that wraps to a second line makes its row taller than the others, which
    // a computed `index * rowHeight` cannot see: the marker would stop short of the wrapped row and
    // every row below it would drift by the extra line.
    useEffect(() => {
        const list = navListRef.current;
        let rafId: number | null = null;

        if (!list) {
            return undefined;
        }

        const measure = (): void => {
            const item = navItemRefs.current[selectedIndex];

            if (!item) {
                return;
            }

            // `offsetTop` is relative to the list, which is the offset parent, so it already
            // carries the header and the container padding.
            setHighlight({ top: item.offsetTop, height: item.offsetHeight });

            if (!isInitializedRef.current) {
                rafId = requestAnimationFrame(() => {
                    isInitializedRef.current = true;
                });
            }
        };

        measure();

        const resizeObserver = new ResizeObserver(measure);

        resizeObserver.observe(list);
        navItemRefs.current.forEach((item) => item && resizeObserver.observe(item));

        return () => {
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
            }

            resizeObserver.disconnect();
        };
    }, [selectedIndex, inputData, listHeader]);

    const isItemListSelected = (index: number): boolean => {
        return selectedIndex === index;
    };

    // check scroll position to select menu option
    useEffect(() => {
        const handleScroll = (): void => {
            if (contentRefs?.current.length) {
                for (let index = 0; index < contentRefs.current.length; index++) {
                    const containerRect = containerRef.current?.getBoundingClientRect();
                    const rect = contentRefs.current[index]?.getBoundingClientRect();
                    const isInView =
                        containerRect && rect
                            ? rect.top <= containerRect.top && rect.bottom > containerRect.top
                            : false;

                    if (isInView) {
                        setSelectedIndex(index);
                        break;
                    }
                }
            }
        };

        const setContainerHeight = (): void => {
            const parentHeight = containerListRef?.current?.parentElement?.offsetHeight || 0;
            const documentHeight = document.documentElement?.clientHeight || 0;

            if (containerListRef?.current) {
                containerListRef.current.style.height = `${parentHeight >= documentHeight ? documentHeight : parentHeight}px`;
            }
        };

        setContainerHeight();

        // Held in a local so the cleanup detaches from the node the listener was attached to,
        // rather than whatever the ref points at by the time the effect tears down.
        const scrollContainer = containerRef.current;

        scrollContainer?.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', setContainerHeight);

        return () => {
            scrollContainer?.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', setContainerHeight);
        };
    }, []);

    return (
        <Box
            sx={{ flexGrow: 1, overflow: 'hidden', height: '100%', ...sx }}
            className={className}
            ref={containerListRef}
            data-testid={dataTestId}
        >
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '1fr 3fr' },
                    justifyContent: 'center',
                    height: '100%',
                }}
            >
                <Box
                    sx={{
                        display: { xs: 'none', sm: 'none', md: 'block' },
                        '--Grid-borderWidth': '1px',
                        borderRight: 'var(--Grid-borderWidth) solid',
                        borderColor: 'divider',
                        height: '100%',
                        overflowY: 'auto',
                    }}
                >
                    <Box
                        ref={navListRef}
                        sx={{
                            p: 2,
                            position: 'relative',
                            '&:before': {
                                content: '""',
                                width: `calc(100% - ${theme.spacing(4)})`,
                                height: `${highlight.height}px`,
                                display: 'block',
                                position: 'absolute',
                                backgroundColor: alpha(
                                    theme.palette.primary.main,
                                    theme.palette.action.selectedOpacity,
                                ),
                                borderRadius: 1,
                                top: `${highlight.top}px`,
                                transition: isInitializedRef.current ? 'all .3s' : 'none',
                            },
                        }}
                    >
                        {listHeader && <Box sx={{ mb: 2 }}>{listHeader}</Box>}
                        {inputData.map((item: InputDataProps, index: number) => (
                            <Link
                                type="button"
                                key={index}
                                data-testid={`${itemDataTestId(item, index)}-nav`}
                                component="button"
                                variant="body1"
                                ref={(node: HTMLElement | null): void => {
                                    navItemRefs.current[index] = node;
                                }}
                                onClick={(): void => {
                                    const element = contentRefs?.current[index];
                                    const container = containerRef.current;

                                    if (element && container) {
                                        const elementRect = element.getBoundingClientRect();
                                        const containerRect = container.getBoundingClientRect();
                                        const elementTop =
                                            elementRect.top - containerRect.top + container.scrollTop + 1;
                                        container.scrollTo({
                                            top: elementTop,
                                            behavior: 'smooth',
                                        });
                                    }

                                    onHeaderClick?.(item, index);
                                }}
                                sx={{
                                    color: theme.palette.text.secondary,
                                    textDecoration: 'none',
                                    cursor: 'pointer',
                                    padding: '12px 16px',
                                    display: 'block',
                                    width: '100%',
                                    // A `<button>` centres its text by UA default, which only shows once a
                                    // label wraps; the rest of the list is left-aligned.
                                    textAlign: 'left',
                                    transition: 'all .2s ease-out',
                                    '&:hover': {
                                        backgroundColor:
                                            selectedIndex === index ? 'transparent' : theme.palette.action.hover,
                                        borderRadius: 1,
                                    },
                                }}
                            >
                                <Box sx={{ justifyContent: 'space-between', display: 'flex' }}>
                                    <Typography
                                        variant="body1"
                                        sx={{ transition: 'all .2s ease-out' }}
                                        color={isItemListSelected(index) ? 'primary' : 'textPrimary'}
                                    >
                                        {item.header}
                                    </Typography>
                                    {item?.additionalHeaderData}
                                </Box>
                            </Link>
                        ))}
                    </Box>
                </Box>
                <Box sx={{ pl: 2, pr: 2, pb: 2, height: '100%', overflowY: 'auto', ...containerSx }} ref={containerRef}>
                    {inputData.map((item, index): React.ReactNode => {
                        const lastItemHeight = contentRefs.current[inputData.length - 1]?.offsetHeight || 0;

                        return (
                            <Box
                                ref={(ref): void => {
                                    contentRefs.current[index] = ref as HTMLElement;
                                }}
                                data-testid={itemDataTestId(item, index)}
                                sx={{
                                    maxWidth: '640px',
                                    margin: '0 auto',
                                    marginBottom: 4,
                                    ...(index === inputData.length - 1
                                        ? {
                                              marginBottom: `calc(100vh - ${lastItemHeight}px)`,
                                          }
                                        : {}),
                                    ...(item.itemSx || {}),
                                }}
                                key={index}
                            >
                                {item?.beforeHeaderContent && <Box sx={{ pt: 2 }}>{item.beforeHeaderContent}</Box>}
                                <Box
                                    sx={{
                                        pt: 3,
                                        ...(item?.contentHeaderAction
                                            ? {
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  justifyContent: 'space-between',
                                              }
                                            : {}),
                                    }}
                                >
                                    <Typography variant="h6">{item.header}</Typography>
                                    {item?.contentHeaderAction}
                                </Box>
                                <Box>{item.children}</Box>
                            </Box>
                        );
                    })}
                </Box>
            </Box>
        </Box>
    );
}

export default ContentList;
