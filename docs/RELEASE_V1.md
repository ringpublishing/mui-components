# Release v1.0.0 — Planning & Process

This document describes the process for collecting breaking changes in the `release/v1` branch before publishing `@ringpublishing/mui-components@1.0.0`.

## Why a release branch?

Non-breaking changes (story migrations, bugfixes, minor features) continue to land in `master` as 0.x releases. Breaking changes are collected in `release/v1` so they ship together in one major bump, minimizing disruption for consumers.

## Keeping release/v1 in sync with master

Before merging a new feature branch into `release/v1`, always update it with the latest `master`:

```bash
git checkout release/v1
git pull origin release/v1
git merge origin/master
git push origin release/v1
```

## Adding a new breaking change

1. Create your feature branch from `release/v1` (or from `master` and rebase onto `release/v1`)
2. Make sure `release/v1` has the latest `master` merged (see above)
3. Open a PR targeting `release/v1` (not `master`)
4. Update `CHANGELOG.md` under the `[1.0.0]` section
5. Get reviews and merge

## Shipping the release

Once all planned breaking changes are collected and validated, the release PR (`release/v1` -> `master`) will be merged, the package published as `1.0.0`, and `release/v1` deleted.
