# Action ids are allocated in a committed lockfile

Each action's callback id comes from `src/action-ids.json`, an append-only map from action name to id that the `action-ids` script maintains and git tracks. Ids were previously the action's base-36 position among its declarations, so inserting or removing an action shifted every id after it — a button still sitting in a user's chat then resolved to whichever handler had inherited its number. Adding `openExportKey` ahead of others was enough to make an old, harmless button print a raw private key.

An id is now a property of the action itself. The allocator hands out `next` and only ever advances it, so an id freed by a removed action is never reissued to a different one. Position stops carrying meaning, which is what made the old scheme fragile.

## Consequences

Adding an action means running `yarn <app> action-ids`; the lockfile is committed alongside the code, and a lefthook pre-commit runs `action-ids:check` so a declaration can never reach a commit ahead of its lockfile.

Renaming an action reads as a removal plus an addition: the new name draws a fresh id and buttons carrying the old one go stale, landing on the existing "menu is out of date" message. That is a deliberate trade — no button ever reaches the wrong handler, and preserving an id across a rename stays available by editing the lockfile entry by hand.

Declarations live in `src/action-declarations.ts`, one module further out than `src/action-ids.ts`, which resolves them against the lockfile. The split is what lets the sync script read the action names while the lockfile is still out of date: resolving validates the lockfile and throws on drift, so a script that imported the resolved ids could never be run to repair them.
