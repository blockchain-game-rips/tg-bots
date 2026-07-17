# tg-bots

Yarn workspaces monorepo. Run all scripts from the repo root using the delegators in the root package.json (e.g. `yarn user typecheck`, `yarn admin build`).

## Package scripts

Below are the current scripts, imported directly from each package.json so they never drift:

- Root: @package.json
- user app: @apps/user/package.json
- admin app: @apps/admin/package.json
- api-client: @packages/api-client/package.json
- grammy-kit: @packages/grammy-kit/package.json
- shared: @packages/shared/package.json

## Agent skills

### Issue tracker

Issues and specs live as markdown under `.scratch/`. See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context: `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
