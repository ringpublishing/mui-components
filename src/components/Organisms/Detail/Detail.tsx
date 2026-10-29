import React, { MouseEvent, useEffect, useState } from 'react';
import { Box, Button, ChipProps, IconButton, Link, Stack, type Theme, Tooltip } from '@mui/material';
import { X, Download, ZoomIn } from 'lucide-react';
import classNames from 'classnames';

import { formatDate } from '../../../helpers/formatDate.js';
import { determineTextColorBasedOnBackground } from '../../../helpers/colors.js';
import EditableText from '../../Atoms/EditableText/EditableText.js';
import { CommonComponentProps, WithDataTestIdSuffix } from '../../../helpers/commonTypes.js';
import { ChipsGroup } from '../../Molecules/ChipsGroup/index.js';
import { LightBox, type LightBoxProps } from '../LightBox/index.js';
import { Media, type MediaProps } from '../Media/index.js';
import { Placeholder, type PlaceholderLabels, PlaceholderVariant } from '../../Molecules/Placeholder/index.js';
import { Image } from '../../../types.js';
import { downloadImage } from '../../../helpers/downloadImage.js';
import { useDataViewContext } from '../../internal/DataViewContext.js';
import { AspectRatioOwnerStateProps } from '../../internal/AspectRatio.js';
import { EditableSelect } from './EditableSelect.js';
import { isImage } from '../../../helpers/types.js';
import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';
import { Typography } from '../../Atoms/Typography/Typography.js';
import { tv } from '../../../helpers/typographyMode.js';

export const DETAIL_WIDTH = 340;

// A value shares its row with the field's icon: it may shrink and wrap anywhere (ids and
// addresses have no natural break points), but never grows past its own width, so a short
// value keeps the icon right beside it.
const VALUE_SX = {
    minWidth: 0,
    flex: '0 1 auto',
    overflowWrap: 'anywhere',
} as const;

// The slot sizes only a bare icon (its direct child); a control keeps its own size. It is one
// caption line tall and centres its content, so a taller control sits on the first line of the value.
const ICON_SLOT_SX = {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    height: (theme: Theme): string => {
        const lineHeight = theme.typography.caption.lineHeight;

        // A unitless line height is a multiplier of the font size; as a height it needs `em`.
        return typeof lineHeight === 'number' ? `${lineHeight}em` : String(lineHeight ?? 'auto');
    },
    '& > svg': {
        width: '20px',
        height: '20px',
    },
} as const;

// Characters kept visible at the end of a middle-elided value: enough for a file name or the
// tail of an id.
const MIDDLE_ELLIPSIS_TAIL = 12;

/*
 * One line with the ellipsis in the middle: the head is clipped by CSS, the tail never shrinks.
 * The whole value stays in the DOM for selection and assistive technology; the tooltip shows it.
 */
function renderMiddleEllipsis(value: string): React.JSX.Element {
    // Code points, not UTF-16 units, so the split never lands inside a surrogate pair.
    const characters = Array.from(value);
    const splitAt = Math.max(0, characters.length - MIDDLE_ELLIPSIS_TAIL);
    const head = characters.slice(0, splitAt).join('');
    const tail = characters.slice(splitAt).join('');

    return (
        <Tooltip title={value} placement="bottom-start">
            <Box component="span" sx={{ display: 'flex', minWidth: 0, maxWidth: '100%', whiteSpace: 'nowrap' }}>
                <Box component="span" sx={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {head}
                </Box>
                <Box component="span" sx={{ flexShrink: 0 }}>
                    {tail}
                </Box>
            </Box>
        </Tooltip>
    );
}

export interface TitleEditable {
    value: string;
    editable: boolean;
    onSubmit: (value: string) => Promise<boolean>;
    label?: string;
}

export interface DetailMediaBottomIconBase {
    tooltip?: string;
}

export interface DetailMediaBottomIconWithIcon extends DetailMediaBottomIconBase {
    onClick: (e: MouseEvent) => void;
    type?: 'icon';
    icon: React.JSX.Element;
}

export interface DetailMediaBottomIconWithChip extends DetailMediaBottomIconBase {
    onClick?: (e: MouseEvent) => void;
    type: 'chip';
    chip: ChipProps;
    color?: string;
}

export type DetailMediaBottomIcon = DetailMediaBottomIconWithIcon | DetailMediaBottomIconWithChip;

export interface DetailMediaBaseProps extends AspectRatioOwnerStateProps, MediaProps, WithDataTestIdSuffix {
    /**
     * Shows the download and zoom buttons in the media toolbar. Requires `image` (a bare
     * `slotProps.media.src` is not enough) and is ignored when `slots.media` is provided.
     * @default false
     */
    imageFullScreenPreview?: boolean;
    /**
     * URL used by the download button and passed to `handleFullScreenPreview` instead of `image`.
     * It does not render a thumbnail — the thumbnail, and the built-in LightBox, always show `image`.
     */
    fullScreenImageUrl?: string;
    bottomIcons?: DetailMediaBottomIcon[];
    /**
     * Whether to show the download icon in the media toolbar.
     * @default true
     */
    enableDownloadIcon?: boolean;
    /**
     * Whether to show the full-screen preview (zoom) icon in the media toolbar.
     * @default true
     */
    enableFullScreenIcon?: boolean;
    /**
     * Callback function called when the user clicks the download button.
     * When provided, it overrides the default download behavior.
     */
    handleImageDownload?: (image: Image | string) => void;
}

export type DetailMediaSlotProps = NonNullable<MediaProps['slotProps']> & {
    /**
     * Props forwarded to the built-in `LightBox` opened by the zoom button.
     * `images`, `open` and `onClose` are managed by `Detail` and cannot be overridden.
     */
    lightBox?: Omit<LightBoxProps, 'images' | 'open' | 'onClose'>;
};

/**
 * `handleFullScreenPreview` and `slotProps.lightBox` are mutually exclusive — provide a custom
 * handler (the built-in LightBox is then not rendered), or props forwarded to the built-in LightBox
 * via the `lightBox` slot, not both.
 */
export type DetailMediaProps = DetailMediaBaseProps &
    (
        | {
              /**
               * Callback called when the user clicks the full-screen preview (zoom) button. When provided,
               * the built-in LightBox is not rendered — the consumer is expected to open its own viewer.
               */
              handleFullScreenPreview?: (image: Image | string) => void;
              slotProps?: NonNullable<MediaProps['slotProps']> & { lightBox?: never };
          }
        | {
              handleFullScreenPreview?: never;
              slotProps?: DetailMediaSlotProps;
          }
    );

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

export interface DetailDescriptionItemFieldTooltip {
    /**
     * Always show the field label tooltip on hover, regardless of whether the label overflows.
     * @default false
     */
    alwaysShowTooltip?: boolean;
    /**
     * Custom tooltip content for the field label. When omitted, the label text is shown (on overflow).
     */
    tooltipTitle?: React.ReactNode;
}

export interface DetailDescriptionItemFieldDefault extends DetailDescriptionItemFieldTooltip {
    name: string;
    value: string | string[];
    formatDate?: boolean;
    icon?: React.JSX.Element | React.JSX.Element[];
    subValue?: DetailDescriptionItemFieldSubValue;
    layout?: DetailDescriptionItemFieldLayout;
    type?: DetailDescriptionItemFieldType.DEFAULT;
    url?: string;
    /**
     * `middle` keeps the value on one line and elides its middle, so the start and the
     * distinguishing end (an id, a file name) stay visible; the full value is in a tooltip.
     * Without it a long value wraps and the field's icon stays beside its first line.
     */
    truncate?: 'middle';
}

export interface DetailDescriptionItemFieldDescription extends DetailDescriptionItemFieldTooltip {
    name: string;
    value: string;
    type: DetailDescriptionItemFieldType.DESCRIPTION;
    layout?: DetailDescriptionItemFieldLayout;
    maxLength?: number;
    showMoreLabel?: string;
    showLessLabel?: string;
}

export interface DetailDescriptionItemFieldChips extends DetailDescriptionItemFieldTooltip {
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

export interface DetailDescriptionItemFieldEditable extends WithDataTestIdSuffix, DetailDescriptionItemFieldTooltip {
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

export interface DetailPlaceholderLabels {
    /** Labels for the empty state placeholder. */
    empty?: PlaceholderLabels;
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
     * Labels for the empty-state placeholder; only `placeholderLabels.empty` is read. When omitted,
     * the Placeholder falls back to its default localized labels.
     */
    placeholderLabels?: DetailPlaceholderLabels;

    /**
     * Overridable components: afterMain, afterDescriptionItems, afterBottomActions.
     */
    slots?: {
        afterMain?: React.JSX.Element;
        afterDescriptionItems?: React.JSX.Element;
        afterBottomActions?: React.JSX.Element;
    };
}

/**
 * `DetailProps` as accepted by `LightBox`'s `detail` slot. Inside the LightBox the media-toolbar
 * buttons (download, full-screen preview) are hidden, so their controls — `enableDownloadIcon`,
 * `enableFullScreenIcon`, `handleImageDownload`, `handleFullScreenPreview`, `lightBoxProps` — are
 * omitted since they would have no effect.
 */
export type LightBoxDetailProps = Omit<DetailProps, 'main'> & {
    main?: Omit<DetailMain, 'mediaProps'> & {
        mediaProps?: Omit<DetailMediaBaseProps, 'enableDownloadIcon' | 'enableFullScreenIcon' | 'handleImageDownload'>;
    };
};

export function Detail(props: DetailProps): React.JSX.Element {
    const {
        main,
        descriptionItems,
        bottomActions,
        empty = false,
        placeholderLabels,
        slots,
        className,
        sx,
        dataTestIdSuffix,
    } = props;

    const childrenDataTestIdSuffix = [dataTestIdSuffix, 'detail'].filter(Boolean).join('-');
    const dataTestId = useRingDataTestId('Detail', dataTestIdSuffix);

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
                <Placeholder
                    variant={PlaceholderVariant.EMPTY}
                    labels={placeholderLabels?.empty}
                    dataTestIdSuffix={childrenDataTestIdSuffix}
                />
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
        // Values are derived into locals — `sectionField` comes from props and must not be
        // mutated, or a re-render with the same object formats the already-formatted value.
        switch (sectionField.type) {
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

        const isChipsField = sectionField.type === DetailDescriptionItemFieldType.CHIPS;

        let displayValue: string | undefined;
        let chipValues: Array<string | DetailDescriptionChipsItem> = [];

        if (sectionField.type === DetailDescriptionItemFieldType.CHIPS) {
            chipValues = Array.isArray(sectionField.value)
                ? sectionField.value
                : sectionField.value
                  ? [sectionField.value]
                  : [];
        } else {
            const rawValue =
                sectionField.formatDate && typeof sectionField.value === 'string'
                    ? formatDate(sectionField.value)
                    : sectionField.value;

            displayValue = Array.isArray(rawValue) ? rawValue.join(', ') : rawValue;
        }

        const verticalLayout = sectionField.layout === DetailDescriptionItemFieldLayout.VERTICAL;
        const defaultField = isChipsField ? null : sectionField;
        const url = defaultField?.url || null;
        const truncateMiddle = defaultField?.truncate === 'middle';

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
                    alwaysShowTooltip={sectionField.alwaysShowTooltip}
                    tooltipTitle={sectionField.tooltipTitle}
                    variant={'caption'}
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
                        display: 'flex',
                        flexWrap: 'wrap',
                        width: verticalLayout ? '100%' : '60%',
                        wordBreak: 'break-word',
                    }}
                >
                    {!isChipsField && (
                        // The value and its icon share one row: the value shrinks and wraps
                        // (or elides) within the row, the icon keeps its size beside the first line.
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', minWidth: 0, maxWidth: '100%' }}>
                            {url === null && (
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: (theme) => theme.palette.text.primary,
                                        ...VALUE_SX,
                                    }}
                                >
                                    {/*if there is no value, display '-' unless there is icon or array of icons*/}
                                    {truncateMiddle && displayValue
                                        ? renderMiddleEllipsis(displayValue)
                                        : displayValue || (sectionField.icon ? '' : '-')}
                                </Typography>
                            )}

                            {displayValue && url !== null && (
                                <Link
                                    href={url}
                                    variant="caption"
                                    sx={{
                                        color: (theme) => theme.palette.primary.main,
                                        ...VALUE_SX,
                                    }}
                                >
                                    {truncateMiddle ? renderMiddleEllipsis(displayValue) : displayValue}
                                </Link>
                            )}

                            {sectionField.icon &&
                                (Array.isArray(sectionField.icon) ? (
                                    // for field with only icons margin should be adjusted
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexShrink: 0,
                                            gap: 1,
                                            marginLeft: displayValue ? 1 : 0,
                                        }}
                                    >
                                        {sectionField.icon.map((icon, index) => (
                                            <Box key={index} sx={ICON_SLOT_SX}>
                                                {icon}
                                            </Box>
                                        ))}
                                    </Box>
                                ) : (
                                    <Box sx={{ ...ICON_SLOT_SX, marginLeft: displayValue ? 1 : 0 }}>
                                        {sectionField.icon}
                                    </Box>
                                ))}
                        </Box>
                    )}

                    {isChipsField && (
                        <Box sx={{ marginTop: 0, width: '100%' }}>
                            <ChipsGroup
                                chips={chipValues.map((badgeValue) => getChipProps(badgeValue))}
                                dataTestIdSuffix={`${childrenDataTestIdSuffix}-${index}`}
                                expandable={true}
                                collapsable={sectionField.collapsable || false}
                            />
                        </Box>
                    )}

                    {!isChipsField && sectionField.subValue && (
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
            sx={[
                { width: `${DETAIL_WIDTH}px`, height: '100%', overflow: 'auto' },
                ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
            ]}
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
                            <Typography variant={'subtitle2'} component={'span'}>
                                {section.sectionTitle}
                            </Typography>
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
                                        color={'inherit'}
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
    const { name, value, maxLength, showMoreLabel, showLessLabel, layout, alwaysShowTooltip, tooltipTitle } = props;
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
                alwaysShowTooltip={alwaysShowTooltip}
                tooltipTitle={tooltipTitle}
                variant={'caption'}
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
    const {
        name,
        value,
        layout,
        onSubmit,
        fieldType = EditableFieldType.TEXT,
        options = [],
        dataTestIdSuffix,
        alwaysShowTooltip,
        tooltipTitle,
    } = props;
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
                alwaysShowTooltip={alwaysShowTooltip}
                tooltipTitle={tooltipTitle}
                variant={'caption'}
                sx={{
                    color: (theme): string => theme.palette.text.secondary,
                    width: verticalLayout ? '100%' : '40%',
                }}
            >
                {name}
            </Typography>
            <Box
                sx={{
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
    const hasFullScreenProps = Boolean(mediaProps?.fullScreenImageUrl || mediaProps?.imageFullScreenPreview);
    const hasMedia = Boolean(mediaProps?.image || mediaProps?.slotProps?.media?.src || mediaProps?.slots?.media);

    useEffect(() => {
        if (process.env.NODE_ENV === 'production' || !hasFullScreenProps || hasMedia) {
            return;
        }

        console.warn(
            'Detail: `main.mediaProps.fullScreenImageUrl` / `imageFullScreenPreview` only complement the ' +
                'thumbnail and do not render one — pass `main.mediaProps.image` too. No media is rendered.',
        );
    }, [hasFullScreenProps, hasMedia]);

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
                <DetailMainBottomIcons {...mediaProps} />
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
                        color="overlay"
                        data-testid={`${dataTestId}-close`}
                        onClick={onCloseClick}
                        aria-label="Close"
                    >
                        <X size={24} />
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
                        sx={(
                            theme,
                        ): {
                            px: number;
                            pb: number;
                            pt: number;
                            justifyContent: string;
                            minHeight: string;
                            '& p': { fontSize: string; lineHeight: string };
                            '& .MuiTextField-root': { width: string };
                            '& .MuiInputBase-input': { fontSize: string; lineHeight: string };
                        } => ({
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

function DetailMainBottomIcons(props: DetailMediaProps): React.JSX.Element {
    const {
        bottomIcons,
        image,
        imageFullScreenPreview,
        fullScreenImageUrl,
        slots,
        dataTestIdSuffix,
        enableDownloadIcon = true,
        enableFullScreenIcon = true,
        handleImageDownload,
        handleFullScreenPreview,
        slotProps,
    } = props;
    const [lightBoxOpen, setLightBoxOpen] = useState(false);

    const dataTestId = useRingDataTestId('Detail', dataTestIdSuffix);

    if (bottomIcons?.some((icon) => icon.type === 'chip') && bottomIcons.some((icon) => icon.type !== 'chip')) {
        console.warn('DetailMainBottomIcons: bottomIcons should be either all of type "chip" or all of type "icon".');
    }

    const isChipsMode = bottomIcons && bottomIcons.length > 0 && bottomIcons[0].type === 'chip';

    const bottomIconsLeft = isChipsMode ? (
        <ChipsGroup
            dataTestIdSuffix={dataTestIdSuffix}
            chips={bottomIcons
                .filter((item): item is DetailMediaBottomIconWithChip => item.type === 'chip')
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
                    {enableDownloadIcon && (
                        <IconButton
                            data-testid={`${dataTestId}-download-image`}
                            color="default"
                            size="medium"
                            onClick={(): void => {
                                const downloadTarget = fullScreenImageUrl || image || '';

                                if (handleImageDownload) {
                                    handleImageDownload(downloadTarget);
                                } else {
                                    downloadImage(downloadTarget);
                                }
                            }}
                            aria-label="Download image"
                        >
                            <Download size={24} />
                        </IconButton>
                    )}
                    {enableFullScreenIcon && (
                        <IconButton
                            data-testid={`${dataTestId}-zoom-in-image`}
                            color="default"
                            size="medium"
                            onClick={(): void => {
                                if (handleFullScreenPreview) {
                                    handleFullScreenPreview(fullScreenImageUrl || image || '');
                                } else {
                                    setLightBoxOpen(true);
                                }
                            }}
                            aria-label="Zoom in"
                        >
                            <ZoomIn size={24} />
                        </IconButton>
                    )}
                    {enableFullScreenIcon && !handleFullScreenPreview && (
                        <LightBox
                            {...slotProps?.lightBox}
                            onClose={(): void => setLightBoxOpen(false)}
                            images={[isImage(image) ? image : { src: image, thumbnailSrc: image }]}
                            open={lightBoxOpen}
                        />
                    )}
                </Stack>
            )}
        </Stack>
    );
}
