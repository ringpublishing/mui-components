@AGENTS.md

<!--
Claude Code reads CLAUDE.md and never AGENTS.md, so this file exists to pull the one
entry point both tools share. Keep it this short: the rules themselves live in
.github/instructions/, linked into .claude/rules/ so they load only when Claude
actually opens a matching file. Adding rule text here would load it into every
session instead — see .claude/rules/README.md.
-->

## Claude Code

Run `npm run test:stories` against a running Storybook before opening a PR that touches
`stories/`, `*.mdx` or `stories/code/`. A docs block that throws is caught by Storybook's
error boundary and painted as text, so `tsc`, ESLint, Vitest and the E2E suite all stay
green and the browser console stays empty. Nothing else in this repo looks at that.

Before committing a change to the changelog, the migration guide, a Storybook page, JSDoc or comments, run the
`release-texts` skill. A `PreToolUse` hook on `git commit` blocks a commit that touches these texts until the skill has
recorded its review.
