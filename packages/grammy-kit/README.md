# @rips/grammy-kit

Shared grammY building blocks (keyboards, actions, sessions, effects, metrics).

## Navigation keyboards

The kit provides the *structure* of navigation — `NavIds` and `buildActionData` —
but not the buttons themselves. Button labels are presentation, and each app owns
its own.

Apps build their nav rows by augmenting grammY's `InlineKeyboard` in their own
code. See `apps/user/src/utils/keyboard.ts` for the user bot's `appendNavButtons`
and `appendHomeButton`, installed via `installKeyboardExtensions()` at startup.
