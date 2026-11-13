// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { themePeerRange, withThemePeer } from '../../scripts/sync-theme-peer.js';

const THEME = '@ringpublishing/mui-theme';

describe('theme peer range of a release', () => {
    it('starts at the theme version the release is built with', () => {
        expect(themePeerRange('5.0.3', '2.0.2')).toBe('^5.0.3');
    });

    it('admits the prereleases of that theme version for a prerelease of the library', () => {
        expect(themePeerRange('5.1.0', '2.1.0-alpha.4')).toBe('^5.1.0-0');
    });

    it('replaces the range in a versioned manifest and keeps the other peers', () => {
        const manifest = { version: '2.0.2', peerDependencies: { [THEME]: '^5.0.0', react: '^18||^19' } };

        expect(withThemePeer(manifest, '5.0.3')).toEqual({
            version: '2.0.2',
            peerDependencies: { [THEME]: '^5.0.3', react: '^18||^19' },
        });
    });

    it('leaves a manifest without a version alone, as in a local build', () => {
        expect(withThemePeer({ peerDependencies: { [THEME]: '^5.0.0' } }, '5.0.3')).toBeNull();
    });

    it('reports nothing to change when the range is already set', () => {
        expect(withThemePeer({ version: '2.0.2', peerDependencies: { [THEME]: '^5.0.3' } }, '5.0.3')).toBeNull();
    });
});
