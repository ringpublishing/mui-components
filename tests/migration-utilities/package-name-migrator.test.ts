import { readFileSync } from 'fs';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

import { describe, it, expect, beforeEach, afterEach, beforeAll, vi } from 'vitest';

import {
    migratePackageNameInFile,
    runPackageNameMigration,
} from '../../src/migration-utilities/package-name-migrator.js';

const OLD_PACKAGE_NAME = '@ring-internal/ui-components';
const NEW_PACKAGE_NAME = '@ringpublishing/mui-components';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const { exports: packageExports } = JSON.parse(readFileSync(path.join(repoRoot, 'package.json'), 'utf8')) as {
    exports: Record<string, unknown>;
};
const exportedSubpaths = Object.keys(packageExports)
    .filter((key) => key !== '.')
    .map((key) => key.slice(1));

describe('Package name migration utils', () => {
    let TEST_DIR: string;

    beforeAll(async () => {
        TEST_DIR = await fs.mkdtemp(path.join(os.tmpdir(), 'pkg-migration-test-'));
    });

    beforeEach(async () => {
        await fs.mkdir(TEST_DIR, { recursive: true });
    });

    afterEach(async () => {
        vi.restoreAllMocks();
        await fs.rm(TEST_DIR, { recursive: true, force: true });
    });

    describe('migratePackageNameInFile', () => {
        it('should rewrite single-line named imports', async () => {
            const testFile = path.join(TEST_DIR, 'named.ts');
            await fs.writeFile(testFile, "import { Button } from '@ring-internal/ui-components';");

            migratePackageNameInFile(testFile, OLD_PACKAGE_NAME, NEW_PACKAGE_NAME);

            const content = await fs.readFile(testFile, 'utf8');
            expect(content).toBe("import { Button } from '@ringpublishing/mui-components';");
        });

        it('should rewrite multi-line named imports', async () => {
            const testFile = path.join(TEST_DIR, 'multi.ts');
            await fs.writeFile(
                testFile,
                `import {
    Button,
    ThemeConfig,
} from '@ring-internal/ui-components';`,
            );

            migratePackageNameInFile(testFile, OLD_PACKAGE_NAME, NEW_PACKAGE_NAME);

            const content = await fs.readFile(testFile, 'utf8');
            expect(content).toContain("from '@ringpublishing/mui-components'");
            expect(content).not.toContain('@ring-internal/ui-components');
        });

        it('should rewrite default imports', async () => {
            const testFile = path.join(TEST_DIR, 'default.ts');
            await fs.writeFile(testFile, "import Foo from '@ring-internal/ui-components';");

            migratePackageNameInFile(testFile, OLD_PACKAGE_NAME, NEW_PACKAGE_NAME);

            const content = await fs.readFile(testFile, 'utf8');
            expect(content).toBe("import Foo from '@ringpublishing/mui-components';");
        });

        it('should rewrite namespace imports', async () => {
            const testFile = path.join(TEST_DIR, 'namespace.ts');
            await fs.writeFile(testFile, "import * as UI from '@ring-internal/ui-components';");

            migratePackageNameInFile(testFile, OLD_PACKAGE_NAME, NEW_PACKAGE_NAME);

            const content = await fs.readFile(testFile, 'utf8');
            expect(content).toBe("import * as UI from '@ringpublishing/mui-components';");
        });

        it('should rewrite side-effect imports', async () => {
            const testFile = path.join(TEST_DIR, 'side-effect.ts');
            await fs.writeFile(testFile, "import '@ring-internal/ui-components';");

            migratePackageNameInFile(testFile, OLD_PACKAGE_NAME, NEW_PACKAGE_NAME);

            const content = await fs.readFile(testFile, 'utf8');
            expect(content).toBe("import '@ringpublishing/mui-components';");
        });

        it('should rewrite dynamic imports', async () => {
            const testFile = path.join(TEST_DIR, 'dynamic.ts');
            await fs.writeFile(testFile, "const lib = await import('@ring-internal/ui-components');");

            migratePackageNameInFile(testFile, OLD_PACKAGE_NAME, NEW_PACKAGE_NAME);

            const content = await fs.readFile(testFile, 'utf8');
            expect(content).toBe("const lib = await import('@ringpublishing/mui-components');");
        });

        it('should rewrite require calls', async () => {
            const testFile = path.join(TEST_DIR, 'require.js');
            await fs.writeFile(testFile, "const lib = require('@ring-internal/ui-components');");

            migratePackageNameInFile(testFile, OLD_PACKAGE_NAME, NEW_PACKAGE_NAME);

            const content = await fs.readFile(testFile, 'utf8');
            expect(content).toBe("const lib = require('@ringpublishing/mui-components');");
        });

        it('should rewrite a dist subpath to the package root', async () => {
            const testFile = path.join(TEST_DIR, 'subpath.ts');
            await fs.writeFile(testFile, "import { Foo } from '@ring-internal/ui-components/dist/foo';");

            migratePackageNameInFile(testFile, OLD_PACKAGE_NAME, NEW_PACKAGE_NAME);

            const content = await fs.readFile(testFile, 'utf8');
            expect(content).toBe("import { Foo } from '@ringpublishing/mui-components';");
        });

        it('should rewrite a dist subpath that already uses the new package name', async () => {
            const testFile = path.join(TEST_DIR, 'new-name-subpath.ts');
            await fs.writeFile(
                testFile,
                "import { TextField } from '@ringpublishing/mui-components/dist/components/Atoms/TextField/TextField.js';",
            );

            const migrated = migratePackageNameInFile(testFile, OLD_PACKAGE_NAME, NEW_PACKAGE_NAME);

            const content = await fs.readFile(testFile, 'utf8');
            expect(migrated).toBe(true);
            expect(content).toBe("import { TextField } from '@ringpublishing/mui-components';");
        });

        it('should keep the icons subpath', async () => {
            const testFile = path.join(TEST_DIR, 'icons.ts');
            await fs.writeFile(testFile, "import { createRingIcon } from '@ring-internal/ui-components/icons';");

            migratePackageNameInFile(testFile, OLD_PACKAGE_NAME, NEW_PACKAGE_NAME);

            const content = await fs.readFile(testFile, 'utf8');
            expect(content).toBe("import { createRingIcon } from '@ringpublishing/mui-components/icons';");
        });

        it('should leave a package.json require that already uses the new package name untouched', async () => {
            const testFile = path.join(TEST_DIR, 'package-json-new-name.cjs.js');
            const original = "const { version } = require('@ringpublishing/mui-components/package.json');";
            await fs.writeFile(testFile, original);

            const migrated = migratePackageNameInFile(testFile, OLD_PACKAGE_NAME, NEW_PACKAGE_NAME);

            const content = await fs.readFile(testFile, 'utf8');
            expect(migrated).toBe(false);
            expect(content).toBe(original);
        });

        it.each(exportedSubpaths)('should keep the %s subpath the exports map exposes', async (subpath) => {
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
            const testFile = path.join(TEST_DIR, 'exported-subpath.ts');
            await fs.writeFile(
                testFile,
                `import a from '${OLD_PACKAGE_NAME}${subpath}';\nconst b = require("${NEW_PACKAGE_NAME}${subpath}");`,
            );

            migratePackageNameInFile(testFile, OLD_PACKAGE_NAME, NEW_PACKAGE_NAME);

            const content = await fs.readFile(testFile, 'utf8');
            expect(content).toBe(
                `import a from '${NEW_PACKAGE_NAME}${subpath}';\nconst b = require("${NEW_PACKAGE_NAME}${subpath}");`,
            );
            expect(warn).not.toHaveBeenCalled();
        });

        it.each(['/package.json5', '/packageXjson', '/icons/index.js'])(
            'should rewrite %s, which the exports map does not expose, to the package root',
            async (subpath) => {
                const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
                const testFile = path.join(TEST_DIR, 'not-exported.ts');
                await fs.writeFile(testFile, `import a from '${OLD_PACKAGE_NAME}${subpath}';`);

                migratePackageNameInFile(testFile, OLD_PACKAGE_NAME, NEW_PACKAGE_NAME);

                const content = await fs.readFile(testFile, 'utf8');
                expect(content).toBe(`import a from '${NEW_PACKAGE_NAME}';`);
                expect(warn).toHaveBeenCalledTimes(1);
            },
        );

        it('should support both single and double quotes', async () => {
            const testFile = path.join(TEST_DIR, 'quotes.ts');
            await fs.writeFile(
                testFile,
                `import { A } from "@ring-internal/ui-components";
import { B } from '@ring-internal/ui-components';`,
            );

            migratePackageNameInFile(testFile, OLD_PACKAGE_NAME, NEW_PACKAGE_NAME);

            const content = await fs.readFile(testFile, 'utf8');
            expect(content).toContain('import { A } from "@ringpublishing/mui-components";');
            expect(content).toContain("import { B } from '@ringpublishing/mui-components';");
        });

        it('should not modify imports from other packages', async () => {
            const testFile = path.join(TEST_DIR, 'other.ts');
            const original = "import { Button } from '@mui/material';\nimport { other } from '@ring-internal/other';";
            await fs.writeFile(testFile, original);

            migratePackageNameInFile(testFile, OLD_PACKAGE_NAME, NEW_PACKAGE_NAME);

            const content = await fs.readFile(testFile, 'utf8');
            expect(content).toBe(original);
        });

        it('should not modify files without matching imports', async () => {
            const testFile = path.join(TEST_DIR, 'no-match.ts');
            const original = 'export const x = 1;';
            await fs.writeFile(testFile, original);

            migratePackageNameInFile(testFile, OLD_PACKAGE_NAME, NEW_PACKAGE_NAME);

            const content = await fs.readFile(testFile, 'utf8');
            expect(content).toBe(original);
        });
    });

    describe('runPackageNameMigration', () => {
        it('should ignore files in node_modules and dist directories', async () => {
            const nodeModulesDir = path.join(TEST_DIR, 'node_modules');
            const distDir = path.join(TEST_DIR, 'dist');
            await fs.mkdir(nodeModulesDir, { recursive: true });
            await fs.mkdir(distDir, { recursive: true });
            const nodeModulesFile = path.join(nodeModulesDir, 'file.js');
            const distFile = path.join(distDir, 'file.js');
            const original = "import { Button } from '@ring-internal/ui-components';";
            await fs.writeFile(nodeModulesFile, original);
            await fs.writeFile(distFile, original);

            runPackageNameMigration(TEST_DIR, OLD_PACKAGE_NAME, NEW_PACKAGE_NAME);

            const nodeModulesContent = await fs.readFile(nodeModulesFile, 'utf8');
            const distContent = await fs.readFile(distFile, 'utf8');
            expect(nodeModulesContent).toBe(original);
            expect(distContent).toBe(original);
        });

        it('should migrate multiple files in nested directories', async () => {
            const someDirectory = path.join(TEST_DIR, 'some-directory');
            const otherDirectory = path.join(TEST_DIR, 'other-directory');
            await fs.mkdir(someDirectory, { recursive: true });
            await fs.mkdir(otherDirectory, { recursive: true });
            const someFile = path.join(someDirectory, 'file.tsx');
            const otherFile = path.join(otherDirectory, 'file.tsx');
            await fs.writeFile(someFile, "import { Button } from '@ring-internal/ui-components';");
            await fs.writeFile(otherFile, "import { Card } from '@ring-internal/ui-components';");

            runPackageNameMigration(TEST_DIR, OLD_PACKAGE_NAME, NEW_PACKAGE_NAME);

            const someFileContent = await fs.readFile(someFile, 'utf8');
            const otherFileContent = await fs.readFile(otherFile, 'utf8');
            expect(someFileContent).toBe("import { Button } from '@ringpublishing/mui-components';");
            expect(otherFileContent).toBe("import { Card } from '@ringpublishing/mui-components';");
        });
    });
});
