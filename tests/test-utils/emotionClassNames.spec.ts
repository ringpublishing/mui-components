import { describe, expect, it } from 'vitest';
import { cloneWithoutClassHashes, stripEmotionClassHashes, stripGridVariablesHash } from './emotionClassNames.js';

describe('stripEmotionClassHashes', () => {
    it('should keep the label of a labelled class', () => {
        expect(stripEmotionClassHashes('css-1nz0ye8-MuiDataGrid-root')).toBe('css-MuiDataGrid-root');
    });

    it('should reduce a class without a label to the cache key', () => {
        expect(stripEmotionClassHashes('css-nwcqhe')).toBe('css');
        expect(stripEmotionClassHashes('css-0')).toBe('css');
    });

    it('should rewrite every Emotion class in the attribute and keep the others', () => {
        expect(stripEmotionClassHashes('MuiBox-root css-1abc2de  ring-box css-k008qs-MuiStack-root Mui-focused')).toBe(
            'MuiBox-root css  ring-box css-MuiStack-root Mui-focused',
        );
    });

    it('should keep a label that starts with lower-case letters', () => {
        expect(stripEmotionClassHashes('css-1abc2de-root-dense')).toBe('css-root-dense');
    });

    it('should keep classes that only contain "css-"', () => {
        const classNames = 'my-css-1abc scss-1abc2de css-Root css-12345678 css-1abc_de css_1abc2de css- css';

        expect(stripEmotionClassHashes(classNames)).toBe(classNames);
    });
});

describe('stripGridVariablesHash', () => {
    it('should drop the hash from the class, the selector and the address', () => {
        expect(stripGridVariablesHash('MuiDataGrid-root MuiDataGridVariables-1575782458 css')).toBe(
            'MuiDataGrid-root MuiDataGridVariables css',
        );
        expect(stripGridVariablesHash('.MuiDataGridVariables-1575782458{--DataGrid-t-radius-base:4px;}')).toBe(
            '.MuiDataGridVariables{--DataGrid-t-radius-base:4px;}',
        );
        expect(stripGridVariablesHash('/MuiDataGridVariables-3691873650')).toBe('/MuiDataGridVariables');
    });

    it('should keep other numbered classes', () => {
        expect(stripGridVariablesHash('MuiGrid-grid-xs-12 MyDataGridVariables-12')).toBe(
            'MuiGrid-grid-xs-12 MyDataGridVariables-12',
        );
    });
});

describe('cloneWithoutClassHashes', () => {
    it('should drop the grid variables hash from the class, the href and the style rules', () => {
        const node = document.createElement('div');

        node.innerHTML =
            '<style href="/MuiDataGridVariables-42">.MuiDataGridVariables-42{--a:1;}</style>' +
            '<div class="MuiDataGridVariables-42 css-1abc2de-MuiDataGrid-root">MuiDataGridVariables-42</div>';

        expect(cloneWithoutClassHashes(node).innerHTML).toBe(
            '<style href="/MuiDataGridVariables">.MuiDataGridVariables{--a:1;}</style>' +
                '<div class="MuiDataGridVariables css-MuiDataGrid-root">MuiDataGridVariables-42</div>',
        );
    });

    it('should strip the hashes in the copy and leave the node as rendered', () => {
        const node = document.createElement('div');

        node.innerHTML = '<p class="css-1abc2de-MuiTypography-root">css-1abc2de</p><svg class="css-vubbuv"></svg>';
        node.setAttribute('class', 'css-0');

        const html = node.outerHTML;
        const copy = cloneWithoutClassHashes(node);

        expect(copy.outerHTML).toBe(
            '<div class="css"><p class="css-MuiTypography-root">css-1abc2de</p><svg class="css"></svg></div>',
        );
        expect(node.outerHTML).toBe(html);
    });

    it('should copy a document fragment', () => {
        const fragment = document.createDocumentFragment();
        const child = document.createElement('span');

        child.setAttribute('class', 'css-1abc2de-label');
        fragment.appendChild(child);

        expect(cloneWithoutClassHashes(fragment).firstElementChild?.getAttribute('class')).toBe('css-label');
        expect(child.getAttribute('class')).toBe('css-1abc2de-label');
    });
});
