---
paths:
  - ".claude/rules/**"
  - ".github/instructions/**"
---

# How the instruction files are wired

Every rule has **one body**. The files live in `.github/instructions/`; this directory holds
symlinks to them, so there is no second copy to drift out of date.

## Why two directories

The tools read from different places and nothing can reconcile that but wiring:

| Tool | Reads from | Scope key |
|---|---|---|
| GitHub Copilot | `.github/instructions/*.instructions.md` | `applyTo:` |
| Claude Code | `.claude/rules/*.md` | `paths:` |

So each instruction file carries **both keys with the same glob**. Each tool reads its own
and ignores the other's:

```yaml
---
applyTo: "stories/**"
paths:
  - "stories/**"
---
```

`CLAUDE.md` at the repository root exists for the same reason: Claude Code reads `CLAUDE.md`
and never `AGENTS.md`, so it pulls the shared entry point in with a single `@AGENTS.md` line.

## Why rules rather than imports in CLAUDE.md

Content imported with `@` is loaded at the start of **every** session, so it saves nothing.
A rule carrying `paths:` loads only once Claude opens a matching file. With six topics the
difference is a rounding error; the point is that the twentieth topic costs nothing either.

## Adding a rule

1. Write `.github/instructions/<topic>.instructions.md` with both keys in its front matter.
2. `ln -s ../../.github/instructions/<topic>.instructions.md .claude/rules/<topic>.md`
3. Add a row to the "Where to read the rules" table in `AGENTS.md`.

Do not move rule text into `AGENTS.md` or `CLAUDE.md`. Both are meant to stay thin entry
points — Claude Code's own documentation targets under 200 lines, because longer files
reduce how consistently the instructions are followed.

## Skills and the commit hook

Skills follow the same pattern as the rules: the body lives in `.github/skills/<name>/SKILL.md`, which Copilot
reads, and `.claude/skills/<name>` is a symlink to that directory for Claude Code.

`release-texts` reviews the texts the package ships: the changelog, the migration guide, Storybook pages, JSDoc and
comments. Two things make sure it runs before a commit:

| Who commits | What runs |
|---|---|
| anyone | `.husky/pre-commit` runs `node scripts/check-texts.mjs`, the mechanical rules, on the staged change |
| Claude Code | `.claude/settings.json` adds a `PreToolUse` hook on `git commit`. It denies the commit while those rules fail, or while staged texts have no recorded review. The skill ends with `node scripts/check-texts.mjs --reviewed`, which records the review for exactly the staged state |

## `.claude/` and git

`.gitignore` ignores all of `.claude/` **except this directory, `skills/` and `settings.json`**, and it should stay that
way: `.claude/worktrees/` grows into gigabytes and `settings.local.json` is one person's
permission list.

## Language

Everything under `.github/instructions/`, this directory, `AGENTS.md` and `CLAUDE.md` is
written in English, matching the rest of the repository's documentation.
