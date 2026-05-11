# ADR-006: Pluggable migrator architecture + package-rename codemod

## Status

Accepted (May 2026)

## Context

The library ships a `run-migration` tool (a binary published with the npm package) that runs codemods to assist consumers with breaking changes. The original implementation under `src/migration-utilities/` was designed for a single use case — renaming components in import statements and JSX usages (e.g. `Skeleton` → `DataView`, `RingFeatureTooltip` → `FeatureTooltip`).

The following limitations surfaced when a different breaking change appeared — **renaming the package itself** (`@ring-internal/ui-components` → `@ringpublishing/mui-components` in `1.1.4`):

1. **Rigid runner.** `migration-runner.ts` exposed a `runMigration(dir, oldName, newName)` signature designed exclusively for component renames. The plan, the confirmation prompt, and the execution logic were fused into one function — none of them could be reused for a different kind of migration without copy-pasting code.

2. **Package name hard-coded in the codemods.** `component-name-migrator.ts` defines `PACKAGE_NAME = '@ringpublishing/mui-components'` as a constant used in the import-matching regex. If a consumer ran `skeleton-to-dataview` against code that still imported from the old package, the codemod **silently matched no imports** — the user might assume nothing needed migrating.

3. **No codemod for renaming the package itself.** Consumers had to fall back on a project-wide find-and-replace of the literal string `@ring-internal/ui-components`, which risks rewriting comments, documentation, test fixtures — anywhere the string appears outside an actual import statement.

4. **No contract between migration scripts and the runner.** Adding a new migration meant copy-pasting boilerplate for argv parsing, path resolution, and the `confirm` prompt.

5. **Migration ordering was implicit.** As a consequence of (2), a consumer upgrading across major versions had to run the `rename-package` step *before* any component-rename codemod — but this requirement was nowhere documented or enforced.

## Decision

### 1. Extract a shared migration runner harness

Introduce interface types in `src/migration-utilities/types.ts`:

- `MigrationPlan` — declarative description of the migration (`title`, `description`, `steps[]`, optional `warnings[]`).
- `MigrationContext` — runtime context (`targetDir` resolved to absolute, plus `args[]` for additional CLI arguments).
- `MigrationExecutor` — `(context) => void | Promise<void>` performing the actual transformation.

`migration-runner.ts` now exposes:

```ts
runMigration(plan: MigrationPlan, context: MigrationContext, execute: MigrationExecutor): Promise<void>
```

The harness owns: path resolution, plan printing, the `Do you want to proceed? (y/N)` prompt, and invoking the executor on confirmation. Every migration script reuses this harness — it only declares its plan and points at an executor.

### 2. Extract shared file-walking utilities

`src/migration-utilities/file-walker.ts` exports `findFiles`, `DEFAULT_IGNORE_DIRS` (`node_modules`, `dist`, `build`, `.git`, `.github`), and `SOURCE_FILE_EXTENSIONS` (`js`, `jsx`, `ts`, `tsx`). Both `component-name-migrator` and the new `package-name-migrator` use them.

### 3. Add `package-name-migrator` as a new migration type

A new module `src/migration-utilities/package-name-migrator.ts` exports `runPackageNameMigration(dir, oldPkg, newPkg)`. A single regex covers every shape of package import:

- `import ... from 'OLD'` (named, default, namespace, multi-line)
- `import 'OLD'` (side-effect)
- `import('OLD')` (dynamic)
- `require('OLD')`
- `'OLD/subpath'` — the subpath segment is preserved as-is

By design it does **not** modify `package.json` — see Consequences.

### 4. Atomic migration scripts

Each file under `scripts/migrations/<name>.ts` does exactly one thing:

- `skeleton-to-dataview.ts` → only `runComponentNameMigration('Skeleton', 'DataView')`
- `ring-feature-tooltip-to-feature-tooltip.ts` → only `runComponentNameMigration('RingFeatureTooltip', 'FeatureTooltip')`
- `rename-package.ts` (new) → only `runPackageNameMigration('@ring-internal/ui-components', '@ringpublishing/mui-components')`

There is no orchestrator that bundles multiple migrations into one invocation. The consumer consciously decides what to run and in what order.

### 5. Document the run order

`stories/migrations/BreakingMigrations.mdx` (section `[1.1.4]`) now states explicitly: a consumer upgrading from `@ring-internal/ui-components` MUST run `rename-package` first, **then** any component-rename codemod. Otherwise — per Context (2) — the component-rename codemod will match nothing and the consumer may believe the migration is a no-op.

## Consequences

### Easier

- **Adding a new migration = one file** in `scripts/migrations/<name>.ts` (~25 lines) declaring a plan + executor. If it's a brand-new *kind* of operation (neither component rename nor package rename), an additional migrator-helper goes into `src/migration-utilities/` — but it shares `file-walker` and the runner harness.
- **A safe codemod for renaming the package.** Consumers get a reliable alternative to a project-wide find/replace, scoped strictly to actual import statements.
- **Consistent shape across migration scripts.** Every plan exposes the same fields (title, description, steps, warnings), so the consumer-facing UX is uniform.

### Harder / new requirements

- **Consumer must know the run order.** `rename-package` before component-rename codemods. Mitigated by the explicit warning in the migration guide and a `warnings` entry in `rename-package`'s plan itself.
- **`package.json` is not modified by the codemod.** Deliberate decision:
  - The consumer keeps control of the version range (`^1.1.4` vs `~1.1.4` vs pinned).
  - The codemod does not touch the lockfile — and the consumer must run `npm install` / `yarn` after the rename anyway.
  - The file is small and trivially editable by hand.
  - The migration guide already lists `package.json` editing as step 1.

### Breaking for *contributors* to the library

- The `runMigration(...)` signature in `migration-runner.ts` changed — every migration script had to be rewritten (done in the same PR).
- Public exports `migrateFile` / `runComponentNameMigration` are preserved unchanged — the existing test suite (`tests/migration-utilities/component-name-migrator.test.ts`) passed without modification.

### Regex-based matching — known limitations

The codemods rely on regex matching (both component-name and package-name). Accepted limitations (consistent with the pre-ADR approach):

- False positives in string literals containing the pattern (e.g. `const s = "from '@ring-internal/ui-components'"` — the embedded string would be rewritten as if it were a real import).
- No AST analysis — block comments containing the pattern could in theory also be rewritten.

In practice these cases are rare enough not to justify pulling in an AST parser (e.g. ts-morph), which would significantly grow the library's dependency surface.

## Affected components

- `src/migration-utilities/types.ts` (new)
- `src/migration-utilities/file-walker.ts` (new)
- `src/migration-utilities/migration-runner.ts` (rewritten — generic harness)
- `src/migration-utilities/component-name-migrator.ts` (refactored — uses `file-walker`, exports unchanged)
- `src/migration-utilities/package-name-migrator.ts` (new)
- `scripts/migrations/skeleton-to-dataview.ts` (rewritten in the declarative shape)
- `scripts/migrations/ring-feature-tooltip-to-feature-tooltip.ts` (rewritten)
- `scripts/migrations/rename-package.ts` (new)
- `tests/migration-utilities/package-name-migrator.test.ts` (new — 13 tests)
- `stories/migrations/BreakingMigrations.mdx` (section `[1.1.4]` — `Automated alternative` block + ordering warning)
- `bin/run-migration.sh` — unchanged
- `package.json` — unchanged
