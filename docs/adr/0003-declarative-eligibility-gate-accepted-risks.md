# The eligibility gate is declarative, and two risks are accepted

The gate collects a user's 18+ declaration and terms acceptance, and records the moment alongside the country observed for the request. It is a record of what the user stated, not enforcement of what is true — this is a Telegram lottery, not an exchange, and audit finding #9 asks that age, terms and jurisdiction be collected and stored, not that every player be screened. No document checks, no third-party age assurance, no sanctions screening: the user declares 18+ by pressing a button, and that declaration is what gets stored.

Two consequences of that choice are **accepted risks**, not oversights. Both were weighed and taken deliberately; neither is defended against.

## Accepted risk: the gate is bypassable with a VPN

The country comes from Cloudflare's `CF-IPCountry` header, which describes where the request arrived from and nothing more. Re-running `/start` re-checks the country, which is exactly how a user who genuinely relocated recovers access — and by the same path, a user on a VPN gets around the gate.

Closing this would mean abandoning the declarative design for enforcement, which is the thing this product deliberately does not build. The recovery loop is worth more than the circumvention costs: a real relocation is a case we must serve, and any mechanism that blocked the VPN user would block the relocated one too.

## Accepted risk: a blocked user cannot withdraw or export their key

The gate wraps the whole `apps/user` action registry. There is no exception list and no ungated marking — deny-by-default is structural, so a new action is gated by construction rather than by remembering to mark it. A user whose country became blocked therefore cannot withdraw funds or export their private key until they pass the flow again.

This is survivable because a failed check is not a dead end. It is the flow's own first step: the check returns the consent screen, whose Agree button leads into the mini app and ends at the country verdict. Every action routes a blocked user into the very flow that can clear the block. A country block is rare and reversible by re-running the flow; a terms bump clears with one tap.

A funds-retrieval carve-out was considered and rejected. It would reintroduce the per-action exception machinery that gating everything removed, and it carried a real defect: withdrawal is signed by the user's own custodial wallet and the backend sponsors no gas, so a blocked user holding only non-native tokens could not have withdrawn anyway unless deposit and swap were opened too.

## Consequences

A reader finding the gate easy to circumvent, or finding a blocked user unable to reach their funds, is looking at a decision rather than a defect — which is why this ADR exists. Neither should be "fixed" without reopening the declarative-gate decision itself.

Because the gate is declarative, **no IP address is stored**: a retained IP defends against nothing here and would only create a retention obligation. `UserEligibility` holds the observed `country`, the accepted `termsVersion`, and `acceptedAt`.

The country source is one function — "give me the country for this request" — so replacing `CF-IPCountry` with another provider later touches that function and nothing else. It would not change the declarative nature of the gate, and so would not retire the VPN risk.

If the client objects to either risk, each reopens as a fresh effort. The blocked-withdrawal one would reopen as a carve-out for funds retrieval, with the gas defect above as its first problem to solve.

Scope worth stating plainly: the gate governs the custodial service only. Rips and the conduit stay permissionless — there is no on-chain enforcement of eligibility, no redeploy and no signed permit.
