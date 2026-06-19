import React, { MouseEvent, useEffect, useState } from 'react';
import { Box, Button, ChipProps, IconButton, Link, Stack, Tooltip } from '@mui/material';
import { CloseOutlined, DownloadOutlined, ZoomInOutlined } from '@mui/icons-material';
import classNames from 'classnames';

import { formatDate } from '../../../helpers/formatDate.js';
import { determineTextColorBasedOnBackground } from '../../../helpers/colors.js';
import EditableText from '../../Atoms/EditableText/EditableText.js';
import { CommonComponentProps, WithDataTestIdSuffix } from '../../../helpers/commonTypes.js';
import { ChipsGroup, LightBox, Media, MediaProps, Placeholder, PlaceholderVariant } from '../../index.js';
import { downloadImage } from '../../../helpers/downloadImage.js';
import { useDataViewContext } from '../../Templates/DataView/DataViewContext.js';
import { AspectRatioOwnerStateProps } from '../../internal/AspectRatio.js';
import { EditableSelect } from '../../internal/EditableSelect.js';
import { isImage } from '../../../helpers/types.js';
import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';
import { Typography } from '../../Atoms/Typography/Typography.js';
import { tv } from '../../../helpers/typographyMode.js';

export const DETAIL_WIDTH = 340;

export interface TitleEditable {
    value: string;
    editable: boolean;
    onSubmit: (value: string) => Promise<boolean>;
    label?: string;
}

interface MediaBottomIconPropsBase {
    tooltip?: string;
}

interface MediaBottomIconPropsIcon extends MediaBottomIconPropsBase {
    onClick: (e: MouseEvent) => void;
    type?: 'icon';
    icon: React.JSX.Element;
}

interface MediaBottomIconPropsChip extends MediaBottomIconPropsBase {
    onClick?: (e: MouseEvent) => void;
    type: 'chip';
    chip: ChipProps;
    color?: string;
}

type MediaBottomIconProps = MediaBottomIconPropsIcon | MediaBottomIconPropsChip;

interface DetailMediaProps extends AspectRatioOwnerStateProps, MediaProps, WithDataTestIdSuffix {
    imageFullScreenPreview?: boolean;
    fullScreenImageUrl?: string;
    bottomIcons?: MediaBottomIconProps[];
}

export interface DetailMain extends WithDataTestIdSuffix {
    mediaProps?: DetailMediaProps;
    title?: string | { value: string } | TitleEditable;
    onCloseClick?: () => void;
}

export interface DetailDescriptionChipsItem {
    value: string;
    onClick?: (arg: DetailDescriptionChipsItem, e: MouseEvent) => void;
    badgeColor?: string;
}

export interface DetailDescriptionItemFieldSubValue {
    label?: string;
    value?: string;
}

export enum DetailDescriptionItemFieldType {
    CHIPS = 'chips',
    DESCRIPTION = 'description',
    EDITABLE = 'editable',
    DEFAULT = 'default',
}

export enum DetailDescriptionItemFieldLayout {
    HORIZONTAL = 'horizontal',
    VERTICAL = 'vertical',
}

export interface DetailDescriptionItemFieldDefault {
    name: string;
    value: string | string[];
    formatDate?: boolean;
    icon?: React.JSX.Element | React.JSX.Element[];
    subValue?: DetailDescriptionItemFieldSubValue;
    layout?: DetailDescriptionItemFieldLayout;
    type?: DetailDescriptionItemFieldType.DEFAULT;
    url?: string;
}

export interface DetailDescriptionItemFieldDescription {
    name: string;
    value: string;
    type: DetailDescriptionItemFieldType.DESCRIPTION;
    layout?: DetailDescriptionItemFieldLayout;
    maxLength?: number;
    showMoreLabel?: string;
    showLessLabel?: string;
}

export interface DetailDescriptionItemFieldChips {
    name: string;
    type: DetailDescriptionItemFieldType.CHIPS;
    value: string | string[] | DetailDescriptionChipsItem[];
    layout?: DetailDescriptionItemFieldLayout;
    collapsable?: boolean;
}

export enum EditableFieldType {
    TEXT = 'text',
    SELECT = 'select',
}

export interface DetailDescriptionItemFieldEditable extends WithDataTestIdSuffix {
    name: string;
    value: string;
    type: DetailDescriptionItemFieldType.EDITABLE;
    fieldType?: EditableFieldType;
    options?: Array<{ value: string; label: string }>;
    onSubmit: (value: string) => Promise<boolean>;
    layout?: DetailDescriptionItemFieldLayout;
}

export type DetailDescriptionItemFieldTypes =
    | DetailDescriptionItemFieldDefault
    | DetailDescriptionItemFieldDescription
    | DetailDescriptionItemFieldChips
    | DetailDescriptionItemFieldEditable;

export interface DetailDescriptionItem {
    sectionTitle: string;
    fields: DetailDescriptionItemFieldTypes[];
}

export interface DetailBottomAction {
    name: string;
    url?: string;
    onClick?: (e: MouseEvent) => void;
    icon?: React.JSX.Element;
}

export interface DetailProps extends CommonComponentProps {
    /**
     * Main section of the detail - contains `title`, `Media` props and bottom icons.
     * Bottom icons can be either all of type 'chip' or all of type 'icon', otherwise some icons may not be rendered.
     */
    main?: DetailMain;
    /**
     * Description items section of the detail - fields in three types: default, chips, description and editable.
     */
    descriptionItems?: DetailDescriptionItem[];
    /**
     * Bottom actions section of the detail - actions with url or on click.
     */
    bottomActions?: DetailBottomAction[];
    /**
     * If `true`, it shows placeholder for empty state.
     */
    empty?: boolean;

    /**
     * Overridable components: afterMain, afterDescriptionItems, afterBottomActions.
     */
    slots?: {
        afterMain?: React.JSX.Element;
        afterDescriptionItems?: React.JSX.Element;
        afterBottomActions?: React.JSX.Element;
    };
}

export function Detail(props: DetailProps): React.JSX.Element {
    const { main, descriptionItems, bottomActions, empty = false, slots, className, sx, dataTestIdSuffix } = props;

    const childrenDataTestIdSuffix = dataTestIdSuffix ?? 'detail';
    const dataTestId = useRingDataTestId(Detail.name, dataTestIdSuffix);

    if (empty) {
        return (
            <Box
                sx={{
                    height: '100%',
                    width: DETAIL_WIDTH,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Placeholder variant={PlaceholderVariant.EMPTY} dataTestIdSuffix={childrenDataTestIdSuffix} />
            </Box>
        );
    }

    const getChipProps = (value: string | DetailDescriptionChipsItem): ChipProps => {
        const badge = typeof value === 'object' && value !== null ? value : { value };
        let badgeOnClickHandler;

        if (badge.onClick) {
            badgeOnClickHandler = (e: MouseEvent): void => badge?.onClick?.(badge, e);
        }

        return {
            variant: 'filled',
            size: 'small',
            color: 'default',
            sx: {
                backgroundColor: badge.badgeColor || '',
                color: (theme) =>
                    badge.badgeColor
                        ? determineTextColorBasedOnBackground(badge.badgeColor)
                        : theme.palette.text.primary,
            },
            label: badge.value,
            onClick: badgeOnClickHandler,
        };
    };

    const renderField = (sectionField: DetailDescriptionItemFieldTypes, index: number): React.JSX.Element => {
        sectionField.type = sectionField.type || DetailDescriptionItemFieldType.DEFAULT;

        switch (sectionField.type) {
            case DetailDescriptionItemFieldType.DEFAULT:
                if (sectionField.formatDate && typeof sectionField.value === 'string') {
                    sectionField.value = formatDate(sectionField.value);
                }

                if (Array.isArray(sectionField.value)) {
                    sectionField.value = sectionField.value.join(', ');
                }

                break;
            case DetailDescriptionItemFieldType.CHIPS:
                if (!Array.isArray(sectionField.value)) {
                    sectionField.value = sectionField.value ? [sectionField.value] : [];
                }

                break;
            case DetailDescriptionItemFieldType.DESCRIPTION:
                return <DescriptionField key={sectionField.name + index} {...sectionField} />;
            case DetailDescriptionItemFieldType.EDITABLE:
                return (
                    <EditableField
                        dataTestIdSuffix={`${childrenDataTestIdSuffix}-${index}`}
                        key={sectionField.name + index}
                        {...sectionField}
                    />
                );
        }

        const verticalLayout = sectionField.layout === DetailDescriptionItemFieldLayout.VERTICAL;
        const url = sectionField.type === DetailDescriptionItemFieldType.DEFAULT ? sectionField.url || null : null;

        return (
            <Stack
                key={sectionField.name + index}
                direction={verticalLayout ? 'column' : 'row'}
                spacing={1}
                sx={{
                    wordBreak: 'break-word',
                    alignItems: 'center',
                }}
            >
                <Typography
                    enableOverflow={true}
                    variant={'label'}
                    sx={{
                        color: (theme) => theme.palette.text.secondary,
                        width: verticalLayout ? '100%' : '40%',
                        alignSelf: 'flex-start',
                    }}
                >
                    {sectionField.name}
                </Typography>
                <Box
                    sx={{
                        '& svg': {
                            width: '20px',
                            height: '20px',
                            marginLeft: 1,
                        },
                        display: 'flex',
                        flexWrap: 'wrap',
                        width: verticalLayout ? '100%' : '60%',
                        wordBreak: 'break-word',
                    }}
                >
                    {sectionField.type !== DetailDescriptionItemFieldType.CHIPS && url === null && (
                        <Typography
                            variant="caption"
                            sx={{
                                color: (theme) => theme.palette.text.primary,
                            }}
                        >
                            {/*if there is no value, display '-' unless there is icon or array of icons*/}
                            {sectionField.value || (sectionField.icon ? '' : '-')}
                        </Typography>
                    )}

                    {sectionField.value &&
                        sectionField.type !== DetailDescriptionItemFieldType.CHIPS &&
                        url !== null && (
                            <Link
                                href={url}
                                typography="caption"
                                sx={{
                                    color: (theme) => theme.palette.primary.main,
                                }}
                            >
                                {sectionField.value}
                            </Link>
                        )}

                    {sectionField.value &&
                        sectionField.type === DetailDescriptionItemFieldType.CHIPS &&
                        Array.isArray(sectionField.value) && (
                            <Box sx={{ marginTop: 0, width: '100%' }}>
                                <ChipsGroup
                                    chips={sectionField.value.map((badgeValue) => getChipProps(badgeValue))}
                                    dataTestIdSuffix={`${childrenDataTestIdSuffix}-${index}`}
                                    expandable={true}
                                    collapsable={sectionField.collapsable || false}
                                />
                            </Box>
                        )}

                    {sectionField.type === DetailDescriptionItemFieldType.DEFAULT &&
                        sectionField.icon &&
                        (Array.isArray(sectionField.icon) ? (
                            // for field with only icons margin should be adjusted
                            <Box display={'flex'} flexWrap={'wrap'} marginLeft={!sectionField.value ? -1 : 0}>
                                {sectionField.icon.map((icon, index) => (
                                    <Box key={index} height={'20px'}>
                                        {icon}
                                    </Box>
                                ))}
                            </Box>
                        ) : (
                            sectionField.icon
                        ))}

                    {sectionField.type === DetailDescriptionItemFieldType.DEFAULT && sectionField.subValue && (
                        <Typography
                            variant="caption"
                            sx={{
                                color: (theme) => theme.palette.text.secondary,
                                width: '100%',
                            }}
                        >
                            {sectionField.subValue.label || ''}
                            {sectionField.subValue.value || ''}
                        </Typography>
                    )}
                </Box>
            </Stack>
        );
    };

    return (
        <Box
            className={classNames('ring-detail', className)}
            data-testid={dataTestId}
            sx={{
                width: `${DETAIL_WIDTH}px`,
                height: '100%',
                overflow: 'auto',
                ...sx,
            }}
        >
            {main ? <DetailMain {...main} /> : null}
            {slots?.afterMain && <Box sx={{ pt: 2, px: 2 }}>{slots.afterMain}</Box>}
            <Box sx={{ px: 2, pb: 2 }}>
                {descriptionItems?.map((section, index) => {
                    return (
                        <Stack
                            key={section.sectionTitle + index}
                            sx={{
                                marginTop: 2,
                                marginBottom: 3,
                            }}
                            gap={1}
                        >
                            <Typography variant={'headline2'}>{section.sectionTitle}</Typography>
                            {section.fields.map((sectionField, index) => renderField(sectionField, index))}
                        </Stack>
                    );
                })}
                {slots?.afterDescriptionItems && <Box sx={{ my: 2 }}>{slots.afterDescriptionItems}</Box>}
                <Stack direction={'column'} gap={1}>
                    {bottomActions
                        ?.filter((item) => item.url || item.onClick)
                        .map((item, index) => {
                            return (
                                <Stack direction={'row'} justifyContent={'flex-start'} key={item.name}>
                                    <Button
                                        key={item.name}
                                        data-testid={`${dataTestId}-bottom-action-${index}`}
                                        variant={'text'}
                                        color={'secondary'}
                                        size={'medium'}
                                        onClick={
                                            item.url
                                                ? (): void => {
                                                      window.open(item.url, '_blank', 'noopener, noreferrer');
                                                  }
                                                : item.onClick
                                        }
                                        startIcon={item.icon}
                                        sx={{
                                            '& .MuiButton-startIcon': {
                                                marginBottom: '3px',
                                            },
                                        }}
                                    >
                                        {item.name}
                                    </Button>
                                </Stack>
                            );
                        })}
                </Stack>
                {slots?.afterBottomActions && <Box sx={{ py: 2 }}>{slots.afterBottomActions}</Box>}
            </Box>
        </Box>
    );
}

Detail.displayName = 'Detail';

export function DescriptionField(props: DetailDescriptionItemFieldDescription): React.JSX.Element {
    const { name, value, maxLength, showMoreLabel, showLessLabel, layout } = props;
    const showFullText = maxLength === undefined;
    const textShorterThanMaxLength = !showFullText && value.length <= maxLength;
    const [showMore, setShowMore] = useState(textShorterThanMaxLength);

    const toggleShowMore = (): void => {
        setShowMore(!showMore);
    };

    const verticalLayout = layout === DetailDescriptionItemFieldLayout.VERTICAL;

    const valueToRender = value || '-';

    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
            <Typography
                enableOverflow={true}
                variant={'label'}
                sx={{
                    color: (theme) => theme.palette.text.secondary,
                    width: verticalLayout ? '100%' : '40%',
                }}
            >
                {name}
            </Typography>
            <Box
                sx={{
                    margin: 0,
                    '& svg': {
                        width: '20px',
                        height: '20px',
                        marginLeft: 1,
                    },
                    display: 'flex',
                    flexWrap: 'wrap',
                    wordBreak: 'break-word',
                    width: verticalLayout ? '100%' : '60%',
                }}
            >
                <Typography
                    variant="caption"
                    sx={{
                        color: (theme) => theme.palette.text.primary,
                    }}
                >
                    {showMore ? valueToRender : `${valueToRender.slice(0, maxLength)}...`}
                </Typography>

                {!textShorterThanMaxLength && (
                    <Typography
                        variant="caption"
                        sx={{
                            color: (theme) => theme.palette.primary.main,
                            cursor: 'pointer',
                        }}
                        onClick={toggleShowMore}
                    >
                        {showMore ? showLessLabel : showMoreLabel}
                    </Typography>
                )}
            </Box>
        </Box>
    );
}

export function EditableField(props: DetailDescriptionItemFieldEditable): React.JSX.Element {
    const { name, value, layout, onSubmit, fieldType = EditableFieldType.TEXT, options = [], dataTestIdSuffix } = props;
    const verticalLayout = layout === DetailDescriptionItemFieldLayout.VERTICAL;

    return (
        <Stack
            direction={verticalLayout ? 'column' : 'row'}
            spacing={1}
            sx={{
                wordBreak: 'break-word',
            }}
        >
            <Typography
                enableOverflow={true}
                variant={'label'}
                sx={{
                    color: (theme): string => theme.palette.text.secondary,
                    width: verticalLayout ? '100%' : '40%',
                }}
            >
                {name}
            </Typography>
            <Box
                sx={{
                    '& svg': {
                        width: '20px',
                        height: '20px',
                        marginLeft: 1,
                    },
                    display: 'flex',
                    flexWrap: 'wrap',
                    width: verticalLayout ? '100%' : '60%',
                }}
            >
                {fieldType === EditableFieldType.TEXT ? (
                    <EditableText dataTestIdSuffix={dataTestIdSuffix} text={value} onSubmit={onSubmit} />
                ) : (
                    <EditableSelect
                        dataTestIdSuffix={dataTestIdSuffix}
                        value={value}
                        options={options}
                        onSubmit={onSubmit}
                    />
                )}
            </Box>
        </Stack>
    );
}

export function DetailMain(props: DetailMain): React.JSX.Element {
    const { title, onCloseClick, mediaProps, dataTestIdSuffix } = props;
    const { dataViewState, setDataViewState } = useDataViewContext();
    const isInDataView = Boolean(dataViewState.onDetailClose);
    const shouldShowCloseIcon = onCloseClick && !(isInDataView && dataViewState.isMobile);

    const dataTestId = useRingDataTestId('Detail', dataTestIdSuffix);

    useEffect(() => {
        if (dataViewState && !dataViewState.onDetailClose && onCloseClick) {
            setDataViewState((n) => ({ ...n, onDetailClose: onCloseClick as () => void }));
        }
    }, [dataViewState, setDataViewState, onCloseClick]);

    return (
        <Box sx={{ position: 'relative', minHeight: '50px' }}>
            {(mediaProps?.image || mediaProps?.slotProps?.media?.src || mediaProps?.slots?.media) && (
                <Media {...mediaProps} disableFullScreenPreview={true} />
            )}
            {mediaProps?.image || mediaProps?.slotProps?.media?.src || mediaProps?.slots?.media ? (
                <DetailMainBottomIons {...mediaProps} />
            ) : null}
            {shouldShowCloseIcon ? (
                <Box
                    sx={{
                        display: 'flex',
                        position: 'absolute',
                        right: 5,
                        top: 5,
                        justifyContent: 'right',
                    }}
                >
                    <IconButton
                        sx={{
                            color: (theme) => theme.palette.action.active,
                            backgroundColor: (theme) => theme.palette.components.detail.close.background,
                            '&:hover': { backgroundColor: (theme) => theme.palette.components.detail.close.hover },
                        }}
                        data-testid={`${dataTestId}-close`}
                        onClick={onCloseClick}
                        aria-label="Close"
                    >
                        <CloseOutlined />
                    </IconButton>
                </Box>
            ) : null}
            {title &&
                (typeof title === 'string' ? (
                    <Typography sx={{ px: 2, pb: 0, pt: 2 }} variant="h6">
                        {title}
                    </Typography>
                ) : 'editable' in title && title.editable ? (
                    <EditableText
                        text={String(title.value)}
                        onSubmit={title.onSubmit}
                        label={title.label || ''}
                        sx={(theme) => ({
                            px: 2,
                            pb: 0,
                            pt:
                                shouldShowCloseIcon &&
                                !(mediaProps?.image || mediaProps?.slotProps?.media?.src || mediaProps?.slots?.media)
                                    ? 5
                                    : 2,
                            justifyContent: 'space-between',
                            minHeight: '45px',
                            '& p': {
                                fontSize: tv('1.25rem')(theme),
                                lineHeight: tv('2rem')(theme),
                            },
                            '& .MuiTextField-root': {
                                width: '100%',
                            },
                            '& .MuiInputBase-input': {
                                fontSize: tv('0.875rem')(theme),
                                lineHeight: tv('1.5rem')(theme),
                            },
                        })}
                    />
                ) : (
                    <Typography sx={{ px: 2, pb: 0, pt: 2 }} variant="h6">
                        {title.value}
                    </Typography>
                ))}
        </Box>
    );
}

function DetailMainBottomIons(props: DetailMediaProps): React.JSX.Element {
    const { bottomIcons, image, imageFullScreenPreview, fullScreenImageUrl, slots, dataTestIdSuffix } = props;
    const [lightBoxOpen, setLightBoxOpen] = useState(false);

    const dataTestId = useRingDataTestId('Detail', dataTestIdSuffix);

    if (!bottomIcons?.every((icon) => icon.type === 'chip') && !bottomIcons?.every((icon) => icon.type !== 'chip')) {
        console.warn('DetailMainBottomIcons: bottomIcons should be either all of type "chip" or all of type "icon".');
    }

    const isChipsMode = bottomIcons && bottomIcons.length > 0 && bottomIcons[0].type === 'chip';

    const bottomIconsLeft = isChipsMode ? (
        <ChipsGroup
            dataTestIdSuffix={dataTestIdSuffix}
            chips={bottomIcons
                .filter((item): item is MediaBottomIconPropsChip => item.type === 'chip')
                .map((item) => ({
                    ...item.chip,
                    onClick: item.onClick,
                    sx: {
                        ...item.chip.sx,
                        ...(item.color && {
                            backgroundColor: item.color,
                            color: determineTextColorBasedOnBackground(item.color),
                        }),
                    },
                }))}
            sx={{ display: 'flex', width: '100%' }}
        />
    ) : (
        (bottomIcons?.map((icon, index) => {
            if (icon.type !== 'chip') {
                return (
                    <Tooltip
                        title={icon?.tooltip}
                        key={icon.tooltip || index}
                        placement="bottom"
                        slotProps={{
                            popper: {
                                modifiers: [
                                    {
                                        name: 'offset',
                                        options: {
                                            offset: [0, -14],
                                        },
                                    },
                                ],
                            },
                        }}
                    >
                        <IconButton
                            data-testid={`${dataTestId}-bottom-icon-${index}`}
                            color="default"
                            size="medium"
                            onClick={icon.onClick}
                            aria-label={icon.tooltip || 'Action'}
                        >
                            {icon.icon}
                        </IconButton>
                    </Tooltip>
                );
            }

            return null;
        }) ?? null)
    );

    return (
        <Stack direction="row" justifyContent="space-between" sx={{ paddingX: 1 }}>
            {isChipsMode ? (
                bottomIconsLeft
            ) : (
                <Stack direction="row" spacing={0}>
                    {bottomIconsLeft}
                </Stack>
            )}
            {image && imageFullScreenPreview && !slots?.media && (
                <Stack direction="row" spacing={0}>
                    <IconButton
                        data-testid={`${dataTestId}-download-image`}
                        color="default"
                        size="medium"
                        onClick={(): Promise<void> => downloadImage(fullScreenImageUrl || image || '')}
                        aria-label="Download image"
                    >
                        <DownloadOutlined />
                    </IconButton>
                    <IconButton
                        data-testid={`${dataTestId}-zoom-in-image`}
                        color="default"
                        size="medium"
                        onClick={(): void => setLightBoxOpen(true)}
                        aria-label="Zoom in"
                    >
                        <ZoomInOutlined />
                    </IconButton>
                    <LightBox
                        onClose={(): void => setLightBoxOpen(false)}
                        images={[isImage(image) ? image : { src: image, thumbnailSrc: image }]}
                        open={lightBoxOpen}
                    />
                </Stack>
            )}
        </Stack>
    );
}
