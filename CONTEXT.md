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

**insufficientAmounts**:
The subset of a user's balances that fall short of what an operation requires. A computed domain result, distinct from any display of it.
_Avoid_: Shortfall, missing funds
