# Message content is a live FormattedString held in in-memory session

Pages and effects carry their message as a `FormattedString` (from `@grammyjs/parse-mode`) rather than an HTML string. This eliminates HTML-escaping as a concern: interpolated data becomes plain text plus formatting entities, so a stray `<` can never break parsing or inject markup. We chose entities over an `html`-escaping tagged template because it removes the hazard by construction instead of guarding it.

## Consequences

`session.lastPage` stores a `FormattedString` **class instance**, which only survives because the session is in-memory (`session({ initial })`, no storage adapter). Persisting sessions (Redis/file) would serialize it to a plain `{rawText, rawEntities}` object and strip its methods, breaking error re-rendering. Persistent session storage is therefore **out of scope**; adopting it later requires a rehydrating session serializer.
