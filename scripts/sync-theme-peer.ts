// Build-time step: sets the lower bound of the `@ringpublishing/mui-theme` peer range to the theme version this
// build was made with, so a consumer who installs the library is told which theme it needs.
//
// CI writes `version` into package.json before it builds. A local build has none, and nothing is changed.

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseChangelog } from './generate-version.js';

const THEME_PACKAGE = '@ringpublishing/mui-theme';

interface PackageManifest {
    version?: string;
    peerDependencies?: Record<string, string>;
}

/**
 * A prerelease of the library may be built before its theme version is released, so its range also admits the
 * prereleases of that theme version.
 */
export function themePeerRange(themeVersion: string, packageVersion: string): string {
    return packageVersion.includes('-') ? `^${themeVersion}-0` : `^${themeVersion}`;
}

/** Returns the manifest with the theme peer range set, or `null` when there is nothing to change. */
export function withThemePeer<T extends PackageManifest>(manifest: T, themeVersion: string): T | null {
    if (!manifest.version) {
        return null;
    }

    const range = themePeerRange(themeVersion, manifest.version);

    if (manifest.peerDependencies?.[THEME_PACKAGE] === range) {
        return null;
    }

    return { ...manifest, peerDependencies: { ...manifest.peerDependencies, [THEME_PACKAGE]: range } };
}

export function syncThemePeer(rootDir: string): string | null {
    const manifestPath = resolve(rootDir, 'package.json');
    const themeChangelog = readFileSync(resolve(rootDir, '../theme/CHANGELOG.md'), 'utf8');
    const themeVersion = parseChangelog(themeChangelog).packageVersionReleased;
    const updated = withThemePeer(JSON.parse(readFileSync(manifestPath, 'utf8')) as PackageManifest, themeVersion);

    if (!updated) {
        return null;
    }

    writeFileSync(manifestPath, `${JSON.stringify(updated, null, 4)}\n`, 'utf8');

    return updated.peerDependencies?.[THEME_PACKAGE] ?? null;
}

// CLI entry — guard prevents side effects on `import`.
const isMainModule
    = typeof process !== 'undefined'
    && process.argv[1]
    && import.meta.url === new URL(process.argv[1], 'file://').href;

if (isMainModule) {
    const range = syncThemePeer(resolve(process.cwd()));

    // eslint-disable-next-line no-console
    console.log(
        range
            ? `[sync-theme-peer] peerDependencies["${THEME_PACKAGE}"] = ${range}`
            : '[sync-theme-peer] nothing to change (no version in package.json, or the range is already set)'
    );
}
