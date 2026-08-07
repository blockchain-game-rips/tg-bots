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

**Entry level**:
One of the tiers a user can enter a rip at, named by its position in the price-sorted list of presets (Small Rip, Medium Rip, Standard Rip). The name is a product label, not API data — the backend exposes presets and configs, and `toEntryLevels` in shared is the single place that decides which preset is which level.
_Avoid_: Preset (in UI copy), tier, package

**Fill window**:
How long a rip stays open for entries, i.e. `durationSeconds` on the config. Named for the deadline it imposes rather than the span it measures.
_Avoid_: Duration, timer

**Entries to fill**:
How many entries a rip needs before it finalizes, i.e. `entryCap` on the config. Named for the target the rip is filling toward, not the ceiling it cannot exceed.
_Avoid_: Entry cap, entries per rip, capacity

**Claim (referral)**:
The user-facing name for withdrawing referral rewards. The operation is called `withdraw reward` in code and in the API; UI copy always says claim ("Available to claim", "Claim Rewards"). Unrelated to the `CLAIMED` rip status, which is internal state behind Completed Rip.
_Avoid_: Withdraw (in UI copy), payout

**Withdraw page**:
The single page where a withdrawal is assembled and sent — amount, recipient, and confirmation in one screen whose content varies by how much of the form is filled and whether funds suffice, not a form page plus a separate checkout. Reached after the chain and currency are chosen.
_Avoid_: Withdraw checkout, withdraw form

**Claim page**:
The confirmation screen for claiming referral rewards. Unlike the Withdraw page it assembles nothing — the amount is always the full available reward and the recipient is the user's own wallet — so it only ever confirms: reward, blockchain fee, and native balance, offering either the claim or a deposit when the balance cannot cover the fee.
_Avoid_: Claim checkout, withdraw reward page

**Variant**:
A named version of one page in the preview bot — the same page rendered from different state, such as whether funds suffice or how much of a form is filled. A page with several states is registered once with a list of variants (`/r <page> [variant]`), never as several separate preview pages; separate entries are only for genuinely separate pages.
_Avoid_: Case, mode, state (as a preview name)

**insufficientAmounts**:
The subset of a user's balances that fall short of what an operation requires. A computed domain result, distinct from any display of it.
_Avoid_: Shortfall, missing funds

**Payment token**:
The currency a user pays for entries with. Always a token the user holds, on any supported chain — distinct from the entry price, which is denominated in Base ETH regardless of what the user pays with. UI copy says payment token, never payment wallet: the user has one EVM wallet, and what they are choosing between is currencies, not wallets.
_Avoid_: Payment wallet, payment method, funding source

**Choose payment token page**:
The shortlist of ways to pay for entries, shown after the entry count is chosen. Always offers Base ETH regardless of balance (the direct path — no bridge or swap), plus every other currency the user holds, plus an escape to the chain → token picker for funds not on the shortlist. Not a currency picker: the browse pickers behind "Pay from another chain" are.
_Avoid_: Payment wallet page, choose payment method page

**Payment route**:
Which of the three ways an entry purchase reaches Base — `direct` (paying in Base ETH, no bridge or swap), `samechain` (zapping from another token on Base), or `crosschain` (zapping from another chain). Determined solely by the payment token, so it is derived wherever it is needed rather than carried through the flow. Decides the quote endpoint, the buy endpoint, and which variant of the Enter success page is rendered. An internal name — it never appears in UI copy.
_Avoid_: Payment method, payment path, entry method
