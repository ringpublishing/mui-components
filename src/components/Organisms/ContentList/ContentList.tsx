import React, { useRef, useState, useEffect } from 'react';
import { Box, Typography, SxProps } from '@mui/material';
import { CommonComponentProps } from '../../../helpers/commonTypes.js';
import { GetItemDataTestId, WithItemDataTestId, resolveItemDataTestId } from '../../../helpers/dataTestId.js';
import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';
import { NavigationMenu, NavigationMenuItem } from '../../Molecules/NavigationMenu/NavigationMenu.js';

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
    const [selectedIndex, setSelectedIndex] = useState(selectedItemIndex);

    useEffect(() => {
        if (contentRefs.current.length) {
            setSelectedIndex(selectedItemIndex);
        }
    }, [selectedItemIndex]);

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
            <Box sx={{ display: 'flex', height: '100%' }}>
                <Box
                    sx={{
                        display: { xs: 'none', sm: 'none', md: 'block' },
                        // A quarter of the width, and up to a half when the longest word of a label needs it: a
                        // narrower column would break that word in the middle. Past a half the word breaks.
                        boxSizing: 'border-box',
                        flex: 'none',
                        width: 'min-content',
                        minWidth: '25%',
                        maxWidth: '50%',
                        '--Grid-borderWidth': '1px',
                        borderRight: 'var(--Grid-borderWidth) solid',
                        borderColor: 'divider',
                        height: '100%',
                        overflowY: 'auto',
                        p: 2,
                    }}
                >
                    {/* Zero width with a percentage minimum: the header fills the column without widening it. */}
                    {listHeader && <Box sx={{ mb: 2, width: 0, minWidth: '100%' }}>{listHeader}</Box>}
                    <NavigationMenu data-testid={`${dataTestId}-nav`}>
                        {inputData.map((item: InputDataProps, index: number) => (
                            <NavigationMenuItem
                                key={index}
                                component="button"
                                selected={isItemListSelected(index)}
                                aria-current={isItemListSelected(index) ? 'location' : undefined}
                                endAdornment={item.additionalHeaderData}
                                data-testid={`${itemDataTestId(item, index)}-nav`}
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
                            >
                                {item.header}
                            </NavigationMenuItem>
                        ))}
                    </NavigationMenu>
                </Box>
                <Box
                    sx={{
                        flex: '1 1 0',
                        minWidth: 0,
                        pl: 2,
                        pr: 2,
                        pb: 2,
                        height: '100%',
                        overflowY: 'auto',
                        ...containerSx,
                    }}
                    ref={containerRef}
                >
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
