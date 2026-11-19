import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, within } from '@testing-library/react';
import { createTheme } from '@mui/material';
import { DataGrid, GridRowsProp, GridColDef, GridRowHeightReturnValue } from '@mui/x-data-grid';
import { renderComboCell } from '../../../../src/index.js';

describe('DataGrid - renderComboCell', () => {
    const comboRows: GridRowsProp = [
        {
            id: 1,
            combo: {
                label: 'Ada i Michał z "Rolnika..." odliczają dni do ślubu. Taką suknię będzie miała panna młoda: nie chcemy przesadzać',
                caption:
                    'Ada i Michał z "Rolnik szuka żony" odliczają dni do ślubu. Taką suknię Ada i Michał z "Rolnika..." ' +
                    'odliczają dni do ślubu. Taką suknię ',
                imageUrl: 'https://design.ringpublishing.com/images/mountains_medium.jpg',
                chips: [
                    'chip0',
                    { label: 'chip1', color: 'primary' },
                    'long chip with very long descirption',
                    'chips4',
                    'chips5',
                    'chips7',
                    'chips8',
                ],
                withComment: true,
                commentIconColor: 'primary',
                badge: 1,
            },
        },
        {
            id: 2,
            combo: {
                label: 'John Adams',
                caption: 'Administrator',
                imageUrl:
                    'https://www.africaventura.fr/_next/image?url=https%3A%2F%2Fmedia.venturatravel.org%2Funsafe%2F1300x%2Fsmart%2Fday_detail%2Fdef634ac-a0e7-4c81-b6ce-7a614198ccfc-_mg_9740.jpg&w=3840&q=75',
                chips: 'chip1',
            },
        },
        {
            id: 3,
            combo: {
                label: 'Thomas Jefferson',
                badge: 1,
            },
        },
    ];
    const comboColumns: GridColDef[] = [
        { field: 'id', headerName: 'Id', width: 100 },
        { field: 'combo', headerName: 'Combo', width: 600, renderCell: renderComboCell },
    ];

    // What the renderer put into the combo cell of a row, read from the rendered grid.
    const readComboCell = (container: HTMLElement, rowId: number): Record<string, unknown> => {
        const cell = within(container).getByTestId(`ring-datagrid-item-${rowId}-combo`);
        const label = cell.querySelector('.MuiTypography-body2') as HTMLElement;
        const image = cell.querySelector('img');
        const badge = cell.querySelector('.MuiChip-outlinedSecondary');

        return {
            // The label without the badge that the full view renders inside it.
            label: label.firstChild?.textContent,
            caption: cell.querySelector('.MuiTypography-caption')?.textContent ?? null,
            image: image && { src: image.getAttribute('src'), alt: image.getAttribute('alt') },
            imageHeight: image && getComputedStyle(image).height,
            placeholderIcon: Boolean(cell.querySelector('svg.lucide-image')),
            commentIcon: Boolean(cell.querySelector('svg.lucide-message-square')),
            badge: badge?.textContent ?? null,
            badgeInsideLabel: badge ? label.contains(badge) : null,
            chips: Array.from(cell.querySelectorAll('.MuiChip-filled'), (chip) => chip.textContent),
        };
    };

    // Everything the renderer put into the combo cell of a row, for the snapshot of its structure.
    const comboCell = (container: HTMLElement, rowId: number): HTMLElement =>
        within(container).getByTestId(`ring-datagrid-item-${rowId}-combo`);

    const [firstRow, secondRow, thirdRow] = comboRows;

    it('should render correctly', () => {
        const { container, getByText } = render(
            <DataGrid rows={comboRows} columns={comboColumns} getRowHeight={(): GridRowHeightReturnValue => 'auto'} />,
        );
        expect(readComboCell(container, 1)).toEqual({
            label: firstRow.combo.label,
            caption: firstRow.combo.caption,
            image: { src: firstRow.combo.imageUrl, alt: '' },
            imageHeight: '48px',
            placeholderIcon: false,
            commentIcon: true,
            badge: '1',
            badgeInsideLabel: true,
            // The first three chips, then the count of the ones kept in the menu.
            chips: ['chip0', 'chip1', 'long chip with very long descirption', '+4'],
        });
        expect(
            within(within(container).getByTestId('ring-datagrid-item-1-combo'))
                .getByText('chip1')
                .closest('.MuiChip-root')
                ?.classList.contains('MuiChip-colorPrimary'),
        ).toBe(true);
        expect(within(container).getByTestId('ring-datagrid-item-1-combo-more').textContent).toBe('+4');
        // The caption is cut with an ellipsis, so the whole text is also its accessible name and tooltip.
        expect(within(container).getByLabelText('Administrator').textContent).toBe('Administrator');
        expect(readComboCell(container, 2)).toEqual({
            label: 'John Adams',
            caption: 'Administrator',
            image: { src: secondRow.combo.imageUrl, alt: '' },
            imageHeight: '48px',
            placeholderIcon: false,
            commentIcon: false,
            badge: null,
            badgeInsideLabel: null,
            chips: ['chip1'],
        });
        expect(readComboCell(container, 3)).toEqual({
            label: 'Thomas Jefferson',
            caption: null,
            image: null,
            imageHeight: null,
            placeholderIcon: false,
            commentIcon: false,
            badge: '1',
            badgeInsideLabel: true,
            chips: [],
        });
        expect(getByText('chip0')).toBeTruthy();
        expect(getByText('Administrator')).toBeTruthy();
        expect(getByText('John Adams')).toBeTruthy();
        expect(comboCell(container, 1)).toMatchSnapshot();
    });

    it('should render correctly for height between 52 and 105', () => {
        const { container, getByText, queryByText } = render(
            <DataGrid rows={comboRows} columns={comboColumns} rowHeight={80} />,
        );
        // The medium view keeps the image (lower) and the caption, moves the badge out of the label, drops the chips.
        expect(readComboCell(container, 1)).toEqual({
            label: firstRow.combo.label,
            caption: firstRow.combo.caption,
            image: { src: firstRow.combo.imageUrl, alt: '' },
            imageHeight: '40px',
            placeholderIcon: false,
            commentIcon: true,
            badge: '1',
            badgeInsideLabel: false,
            chips: [],
        });
        expect(readComboCell(container, 2)).toMatchObject({
            label: 'John Adams',
            caption: 'Administrator',
            image: { src: secondRow.combo.imageUrl, alt: '' },
            imageHeight: '40px',
            chips: [],
        });
        expect(readComboCell(container, 3)).toMatchObject({
            label: thirdRow.combo.label,
            caption: null,
            image: null,
            badge: '1',
            badgeInsideLabel: false,
        });
        expect(queryByText('chip0')).toBeNull();
        expect(getByText('Administrator')).toBeTruthy();
        expect(getByText('John Adams')).toBeTruthy();
        expect(comboCell(container, 1)).toMatchSnapshot();
    });

    it('should render correctly for density=compact', () => {
        const { container, getByText, queryByText } = render(
            <DataGrid rows={comboRows} columns={comboColumns} density="compact" />,
        );
        // The small view is the label line alone: comment icon, label and badge.
        expect(readComboCell(container, 1)).toEqual({
            label: firstRow.combo.label,
            caption: null,
            image: null,
            imageHeight: null,
            placeholderIcon: false,
            commentIcon: true,
            badge: '1',
            badgeInsideLabel: false,
            chips: [],
        });
        expect(readComboCell(container, 2)).toMatchObject({
            label: 'John Adams',
            caption: null,
            image: null,
            chips: [],
        });
        expect(readComboCell(container, 3)).toMatchObject({ label: thirdRow.combo.label, image: null, badge: '1' });
        expect(queryByText('chip0')).toBeNull();
        expect(queryByText('Administrator')).toBeNull();
        expect(getByText('John Adams')).toBeTruthy();
        expect(comboCell(container, 1)).toMatchSnapshot();
    });

    it('should show placeholder when imageUrl is undefined and showPlaceholder is true', () => {
        const { container } = render(
            <DataGrid
                rows={[
                    {
                        id: 1,
                        combo: {
                            label: 'Thomas Jefferson',
                            caption: 'Image url not provided and showPlaceholder is true',
                            badge: 1,
                            showPlaceholder: true,
                        },
                    },
                ]}
                columns={comboColumns}
                getRowHeight={(): GridRowHeightReturnValue => 'auto'}
            />,
        );
        expect(readComboCell(container, 1)).toEqual({
            label: 'Thomas Jefferson',
            caption: 'Image url not provided and showPlaceholder is true',
            image: null,
            imageHeight: null,
            placeholderIcon: true,
            commentIcon: false,
            badge: '1',
            badgeInsideLabel: true,
            chips: [],
        });
        expect(
            within(container)
                .getByTestId('ring-datagrid-item-1-combo-placeholder-icon')
                .contains(container.querySelector('svg.lucide-image')),
        ).toBe(true);
        expect(container.querySelector('svg.lucide-image-off')).toBeNull();
        expect(container.querySelector('svg.lucide-image')).toBeTruthy();
        expect(comboCell(container, 1)).toMatchSnapshot();
    });

    it('fits the placeholder plate inside the 40px thumbnail of the medium view', () => {
        const placeholderRows = [{ id: 1, combo: { label: 'No logo', showPlaceholder: true } }];
        const plateOf = (container: HTMLElement): CSSStyleDeclaration =>
            getComputedStyle(
                within(container).getByTestId('ring-datagrid-item-1-combo-placeholder-icon')
                    .firstElementChild as HTMLElement,
            );

        const medium = render(<DataGrid rows={placeholderRows} columns={comboColumns} density="standard" />);
        expect([plateOf(medium.container).width, plateOf(medium.container).height]).toEqual(['32px', '32px']);
        medium.unmount();

        const full = render(
            <DataGrid
                rows={placeholderRows}
                columns={comboColumns}
                getRowHeight={(): GridRowHeightReturnValue => 'auto'}
            />,
        );
        expect(plateOf(full.container).width).toBe('2.5em');
    });

    it('shows ImageOff when the image fails to load, unlike a missing image', () => {
        const { container } = render(
            <DataGrid
                rows={[{ id: 1, combo: { label: 'Broken image', imageUrl: 'https://example.invalid/broken.jpg' } }]}
                columns={comboColumns}
                getRowHeight={(): GridRowHeightReturnValue => 'auto'}
            />,
        );

        fireEvent.error(container.querySelector('img') as HTMLImageElement);

        expect(container.querySelector('svg.lucide-image-off')).toBeTruthy();
        expect(container.querySelector('svg.lucide-image')).toBeNull();
    });

    it('leaves the error state when the row gets another url or loses it', () => {
        const grid = (combo: Record<string, unknown>): React.JSX.Element => (
            <DataGrid
                rows={[{ id: 1, combo: { label: 'Changing image', ...combo } }]}
                columns={comboColumns}
                getRowHeight={(): GridRowHeightReturnValue => 'auto'}
            />
        );
        const { container, rerender } = render(grid({ imageUrl: 'https://example.invalid/broken.jpg' }));

        fireEvent.error(container.querySelector('img') as HTMLImageElement);
        expect(container.querySelector('svg.lucide-image-off')).toBeTruthy();

        rerender(grid({ imageUrl: 'https://example.invalid/fixed.jpg' }));
        expect(container.querySelector('img')?.getAttribute('src')).toBe('https://example.invalid/fixed.jpg');

        rerender(grid({ showPlaceholder: true }));
        expect(container.querySelector('svg.lucide-image')).toBeTruthy();
        expect(container.querySelector('svg.lucide-image-off')).toBeNull();
    });

    it('shows the caption at the default density', () => {
        const { getByText } = render(<DataGrid rows={comboRows} columns={comboColumns} />);

        expect(getByText('Administrator')).toBeTruthy();
    });

    it('keeps the label-only view in rows lower than the default at the default density', () => {
        const { queryByText, unmount } = render(<DataGrid rows={comboRows} columns={comboColumns} rowHeight={35} />);

        expect(queryByText('Administrator')).toBeNull();
        unmount();

        expect(
            render(<DataGrid rows={comboRows} columns={comboColumns} getRowHeight={(): number => 36} />).queryByText(
                'Administrator',
            ),
        ).toBeNull();
    });

    it('shows the caption at the comfortable density', () => {
        const { getByText } = render(<DataGrid rows={comboRows} columns={comboColumns} density="comfortable" />);

        expect(getByText('Administrator')).toBeTruthy();
    });

    it('shows the caption when getRowHeight returns the default height for a grid with a lower rowHeight', () => {
        const { getByText } = render(
            <DataGrid rows={comboRows} columns={comboColumns} rowHeight={35} getRowHeight={(): number => 52} />,
        );

        expect(getByText('Administrator')).toBeTruthy();
    });

    it('sets the body2 line height, so a column without display flex keeps the caption in the row', () => {
        const { container } = render(<DataGrid rows={comboRows} columns={comboColumns} />);

        expect(getComputedStyle(container.querySelector('.MuiCard-root') as HTMLElement).lineHeight).toBe(
            String(createTheme().typography.body2.lineHeight),
        );
    });
});
