// Type-level contract: `tsc` (build:check-ts) checks this file; Vitest does not collect `*.test-d.ts`.
import type { QueryClient } from '@tanstack/react-query';
import type { ComponentProps } from 'react';
import { describe, expectTypeOf, it } from 'vitest';
import type {
    ActionBoxItem,
    ActiveCardChangeParams,
    AlertAction,
    AlertProps,
    AutocompleteOption,
    BottomBarApiRef,
    BottomBarContextState,
    BottomBarSlotProps,
    BulkOperationAction,
    CommentProps,
    CommonComponentProps,
    CommonTreeViewProps,
    createSpacerItem,
    ContentListProps,
    DataToolbarLabels,
    DataViewProps,
    DetailMediaBaseProps,
    DetailMediaBottomIcon,
    FeatureTooltipActions,
    FeatureTooltipProps,
    FilterChip,
    FileUploaderLabels,
    FileUploaderProps,
    FileUploaderRejection,
    FileUploaderRejectionReason,
    GetItemDataTestId,
    InfiniteScrollOptions,
    InputDataProps,
    MediaBottomTooltipProps,
    MediaCardFieldsItem,
    MediaCardProps,
    MediaGridApi,
    MediaGridApiInstance,
    MediaProps,
    MediaSlotProps,
    MediaSlots,
    MuiOption,
    MultimediaGridProps,
    OnAddApi,
    Option,
    Range,
    RangeDefinition,
    RangesOption,
    RangesRange,
    RingDataGridProps,
    RingDrawer,
    RingDrawerProps,
    RingGridInitialState,
    RingLucideIcon,
    RingLucideIconColor,
    RingLucideIconProps,
    SimpleTreeProps,
    SpacerItemProps,
    DataTreeProps,
    TreeQueryClient,
    useActiveCardChange,
    useGridApiRef,
    VariantType,
    WithItemDataTestId,
} from '../../src/index.js';

// A type a public prop is declared with has to be importable from the package entry: `exports` leaves a consumer
// no other path to it. Dropping one of these from the entry fails the import above.
describe('types of public props are exported from the package entry', () => {
    it('FilterChip types the filter chips of RingDataGrid and MultimediaGrid', () => {
        expectTypeOf<NonNullable<RingDataGridProps['filterChips']>['chips']>().toEqualTypeOf<FilterChip[]>();
        expectTypeOf<NonNullable<MultimediaGridProps['filterChips']>['chips']>().toEqualTypeOf<FilterChip[]>();
    });

    it('BottomBarSlotProps types the DataView bottom slot', () => {
        expectTypeOf<NonNullable<DataViewProps['slotProps']>['bottom']>().toEqualTypeOf<
            BottomBarSlotProps | undefined
        >();
    });

    it('BottomBarApiRef types the grid API handed to the bottom bar onClick', () => {
        expectTypeOf<Parameters<NonNullable<BottomBarSlotProps['onClick']>>[1]>().toEqualTypeOf<BottomBarApiRef>();
    });

    it('MediaGridApi types the MultimediaGrid apiRef and narrows BottomBarApiRef', () => {
        expectTypeOf<ReturnType<typeof useGridApiRef>>().toEqualTypeOf<MediaGridApi>();
        expectTypeOf<MultimediaGridProps['apiRef']>().toEqualTypeOf<MediaGridApi | undefined>();
        expectTypeOf<MediaGridApi>().toExtend<BottomBarApiRef>();
    });

    it('FileUploaderRejection types the onFilesRejected callback, with FileUploaderRejectionReason as its reason', () => {
        expectTypeOf<Parameters<NonNullable<FileUploaderProps['onFilesRejected']>>[0]>().toEqualTypeOf<
            FileUploaderRejection[]
        >();
        expectTypeOf<FileUploaderRejection['reason']>().toEqualTypeOf<FileUploaderRejectionReason>();
    });

    it('every exported component has its props type exported', () => {
        expectTypeOf<Parameters<typeof RingDrawer>[0]>().toEqualTypeOf<RingDrawerProps>();
        expectTypeOf<ComponentProps<typeof RingLucideIcon>>().toExtend<RingLucideIconProps>();
        expectTypeOf<RingLucideIconProps['color']>().toEqualTypeOf<RingLucideIconColor | undefined>();
    });
});

describe('tree queryClient prop', () => {
    it('TreeQueryClient accepts a TanStack Query QueryClient without the package root importing its types', () => {
        expectTypeOf<QueryClient>().toExtend<TreeQueryClient>();
        expectTypeOf<SimpleTreeProps['queryClient']>().toEqualTypeOf<TreeQueryClient | undefined>();
        expectTypeOf<DataTreeProps['queryClient']>().toEqualTypeOf<TreeQueryClient | undefined>();
    });
});

// Types a consumer builds or annotates separately — list items, labels, callback arguments, slots, API handles — are
// exported from the entry, so a declaration like `const fields: MediaCardFieldsItem[] = …` compiles.
describe('types of public props are exported from the package entry (2.0.0)', () => {
    it('shared bases of every props type', () => {
        expectTypeOf<AlertProps>().toExtend<CommonComponentProps>();
        expectTypeOf<ActionBoxItem>().toExtend<WithItemDataTestId>();
        expectTypeOf<ContentListProps['getItemDataTestId']>().toEqualTypeOf<
            GetItemDataTestId<InputDataProps> | undefined
        >();
    });

    it('list items and labels', () => {
        expectTypeOf<AlertProps['action']>().toEqualTypeOf<AlertAction | undefined>();
        expectTypeOf<MediaCardProps['fields']>().toEqualTypeOf<MediaCardFieldsItem[] | undefined>();
        expectTypeOf<OnAddApi['addComment']>().toEqualTypeOf<(comment: CommentProps) => void>();
        expectTypeOf<FileUploaderProps['labels']>().toEqualTypeOf<FileUploaderLabels>();
        expectTypeOf<FeatureTooltipProps['actions']>().toEqualTypeOf<FeatureTooltipActions>();
        expectTypeOf<RingDataGridProps['initialState']>().toEqualTypeOf<RingGridInitialState | undefined>();
        expectTypeOf<MultimediaGridProps['labels']>().toEqualTypeOf<DataToolbarLabels | undefined>();
        expectTypeOf<MultimediaGridProps['hasMore']>().toEqualTypeOf<InfiniteScrollOptions['hasMore']>();
    });

    it('argument types of public functions', () => {
        expectTypeOf<Parameters<typeof createSpacerItem>[0]>().toEqualTypeOf<SpacerItemProps>();
        expectTypeOf<CommonTreeViewProps['variant']>().toEqualTypeOf<VariantType>();
    });

    it('one BulkOperationAction shape for RingDataGrid and MultimediaGrid', () => {
        expectTypeOf<MultimediaGridProps['bulkActions']>().toEqualTypeOf<BulkOperationAction[] | undefined>();
        expectTypeOf<RingDataGridProps['bulkActions']>().toEqualTypeOf<BulkOperationAction[] | undefined>();
    });

    it('slots of Media and Detail', () => {
        expectTypeOf<MediaProps['slots']>().toEqualTypeOf<MediaSlots | undefined>();
        expectTypeOf<MediaProps['slotProps']>().toEqualTypeOf<MediaSlotProps | undefined>();
        expectTypeOf<MediaProps['bottomTooltips']>().toEqualTypeOf<MediaBottomTooltipProps[] | undefined>();
        expectTypeOf<DetailMediaBaseProps['bottomIcons']>().toEqualTypeOf<DetailMediaBottomIcon[] | undefined>();
    });

    it('grid API handles', () => {
        expectTypeOf<MediaGridApi['current']>().toEqualTypeOf<MediaGridApiInstance | null>();
        expectTypeOf<Parameters<typeof useActiveCardChange>[1]>().toEqualTypeOf<
            (params: ActiveCardChangeParams) => void
        >();
        expectTypeOf<BottomBarApiRef>().toEqualTypeOf<BottomBarContextState['apiRef']>();
    });

    it('generic names are deprecated aliases of the prefixed ones', () => {
        expectTypeOf<Option>().toEqualTypeOf<RangesOption>();
        expectTypeOf<Range>().toEqualTypeOf<RangesRange>();
        expectTypeOf<RangeDefinition['rangeOptions']>().toEqualTypeOf<RangesOption[] | undefined>();
        expectTypeOf<MuiOption>().toEqualTypeOf<AutocompleteOption>();
    });
});
