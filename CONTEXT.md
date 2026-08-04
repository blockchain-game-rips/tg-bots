# tg-bots

Telegram bots (user + admin) built on grammy, sharing a message-rendering kit and domain helpers.

## Language

**Page**:
A renderable screen — its message content plus inline keyboard (and optional photo). Produced by a page's `render` function as a `PageContent`.
_Avoid_: Screen, view

**FormattedString**:
The canonical representation of message text: plain text plus formatting entities, from `@grammyjs/parse-mode`. Bots never build HTML markup strings; formatting is expressed as entities.
_Avoid_: HTML string, markup string

**Effect**:
A description of what the bot should do in response to an action (edit a page, ask for input, show loading). Interpreted by the effect executor, which owns all Telegram API calls.
_Avoid_: Command, action result

**Finalized Rip**:
A rip that has reached a terminal state — it either paid out or returned entry fees. The umbrella over Completed and Refunded; every finalized rip is exactly one of the two. Spans `RipStatusGroup.COMPLETED` and `RipStatusGroup.REFUNDED` in shared; `isFinalized` tests for it. Backs the `/rips/rips/finished` feed.
_Avoid_: Finished, settled, closed

**Completed Rip**:
A finalized rip that ran its course and paid out, i.e. rip status `CLAIMED`. Named for the rip's outcome, not for whether the user has claimed anything — claiming is internal state and never surfaces in UI copy.
_Avoid_: Claimed, won, paid out

**Refunded Rip**:
A finalized rip that was unwound and returned entry fees, i.e. rip status `REFUNDED`.

**insufficientAmounts**:
The subset of a user's balances that fall short of what an operation requires. A computed domain result, distinct from any display of it.
_Avoid_: Shortfall, missing funds
