// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { collectPackageExports, PackageExport, readExportsSnapshot } from '../../scripts/exports-snapshot.js';

// Builds a TypeScript program over the three package entries: a few seconds, more when the suite competes for the CPU.
const PROGRAM_TIMEOUT_MS = 60_000;

const key = ({ entry, name }: PackageExport): string => `${entry} → ${name}`;

describe('package exports snapshot', () => {
    it(
        'exports exactly the names recorded in tests/package/exports.snapshot.json',
        () => {
            const live = new Map(collectPackageExports().map((item) => [key(item), item.kind]));
            const recorded = new Map(readExportsSnapshot().map((item) => [key(item), item.kind]));

            const added = [...live.keys()].filter((name) => !recorded.has(name));
            const removed = [...recorded.keys()].filter((name) => !live.has(name));
            const changed = [...live]
                .filter(([name, kind]) => recorded.has(name) && recorded.get(name) !== kind)
                .map(([name, kind]) => `${name} (${recorded.get(name)} → ${kind})`);

            expect(
                { added, removed, changed },
                'The public API of the package changed. When that is intended, add a changelog entry and run `npm run test:update:exports`; a removal is a breaking change.',
            ).toEqual({ added: [], removed: [], changed: [] });
        },
        PROGRAM_TIMEOUT_MS,
    );
});
