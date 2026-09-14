# user

## Running the gate locally

The gate reads the caller's country from the `cf-ipcountry` header, which only
Cloudflare sets. Run it behind a Cloudflare tunnel locally, the same way it runs
in production — without one the header is absent, every `/verify` answers 422,
and the mini app shows its error screen.

There is deliberately no override to stand in for the header. Point `GATE_URL`
at the tunnel's public address; `GATE_PORT` stays local, and the tunnel forwards
to it.
