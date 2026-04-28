import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Box, Link, Typography, useTheme, SxProps } from '@mui/material';
import { CommonComponentProps } from '../../../helpers/commonTypes.js';
import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';

export interface InputDataProps {
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
     * Additional content rendered above the header on the left side
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
}

export function ContentList({
    inputData,
    selectedItemIndex = 0,
    onHeaderClick,
    listHeader,
    dataTestIdSuffix,
    sx,
    className,
    containerSx = {},
}: ContentListProps): React.JSX.Element {
    const contentRefs = useRef<(HTMLElement | null)[]>([]);
    const dataTestId = useRingDataTestId(ContentList.name, dataTestIdSuffix);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const containerListRef = useRef<HTMLDivElement | null>(null);
    const listHeaderRef = useRef<HTMLDivElement | null>(null);
    const isInitializedRef = useRef<boolean>(false);
    const [selectedIndex, setSelectedIndex] = useState(selectedItemIndex);
    const [listHeaderHeight, setListHeaderHeight] = useState(0);

    const theme = useTheme();

    const NAVIGATION_ITEM_HEIGHT = 48; // padding: 12px top + 12px bottom + ~24px line height
    const CONTAINER_PADDING = parseFloat(theme.spacing(2)); // Box padding (p: 2)
    const HEADER_MARGIN_BOTTOM = parseFloat(theme.spacing(2)); // listHeader margin bottom (mb: 2)

    const headerOffset = useMemo(() => {
        return listHeaderHeight > 0 ? listHeaderHeight + HEADER_MARGIN_BOTTOM : 0;
    }, [listHeaderHeight, HEADER_MARGIN_BOTTOM]);

    useEffect(() => {
        if (contentRefs.current.length) {
            setSelectedIndex(selectedItemIndex);
        }
    }, [selectedItemIndex]);

    useEffect(() => {
        const headerElement = listHeaderRef.current;
        let rafId: number | null = null;
        let resizeObserver: ResizeObserver | null = null;

        if (!headerElement) {
            setListHeaderHeight(0);

            if (!isInitializedRef.current) {
                rafId = requestAnimationFrame(() => {
                    isInitializedRef.current = true;
                });
            }
        } else {
            setListHeaderHeight(headerElement.offsetHeight);

            if (!isInitializedRef.current) {
                rafId = requestAnimationFrame(() => {
                    isInitializedRef.current = true;
                });
            }

            resizeObserver = new ResizeObserver((entries) => {
                const newHeight = entries[0]?.contentRect.height;

                if (newHeight !== undefined) {
                    setListHeaderHeight(newHeight);
                }
            });

            resizeObserver.observe(headerElement);
        }

        return () => {
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
            }

            if (resizeObserver !== null) {
                resizeObserver.disconnect();
            }
        };
    }, [listHeader]);

    const isItemListSelected = (index: number): boolean => {
        return selectedIndex === index;
    };

    // check scroll position to select menu option
    useEffect(() => {
        const handleScroll = () => {
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

        const setContainerHeight = () => {
            const parentHeight = containerListRef?.current?.parentElement?.offsetHeight || 0;
            const documentHeight = document.documentElement?.clientHeight || 0;

            if (containerListRef?.current) {
                containerListRef.current.style.height = `${parentHeight >= documentHeight ? documentHeight : parentHeight}px`;
            }
        };

        setContainerHeight();

        containerRef?.current?.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', setContainerHeight);

        return () => {
            containerRef?.current?.removeEventListener('scroll', handleScroll);
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
                        sx={{
                            p: 2,
                            position: 'relative',
                            '&:before': {
                                content: '""',
                                width: `calc(100% - ${theme.spacing(4)})`,
                                height: theme.spacing(6),
                                display: 'block',
                                position: 'absolute',
                                // @ts-expect-error FIXME - extended theme type should be exported from ring-mui-theme
                                backgroundColor: theme.palette.primary.selected,
                                borderRadius: 1,
                                top: `${selectedIndex * NAVIGATION_ITEM_HEIGHT + CONTAINER_PADDING + headerOffset}px`,
                                transition: isInitializedRef.current ? 'all .3s' : 'none',
                            },
                        }}
                    >
                        {listHeader && (
                            <Box ref={listHeaderRef} sx={{ mb: 2 }}>
                                {listHeader}
                            </Box>
                        )}
                        {inputData.map((item: InputDataProps, index: number) => (
                            <Link
                                type="button"
                                key={index}
                                component="button"
                                variant="body1"
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
                                    transition: 'all .2s ease-out',
                                    '&:hover': {
                                        backgroundColor:
                                            selectedIndex === index ? 'transparent' : theme.palette.grey[50],
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
                                ref={(ref) => {
                                    contentRefs.current[index] = ref as HTMLElement;
                                }}
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
