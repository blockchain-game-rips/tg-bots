const COUNTRY_HEADER = 'cf-ipcountry'

/**
 * Values Cloudflare sends that are not ISO country codes — `XX` when it has no
 * data, `T1` for Tor. Named here only to record that they are expected; they are
 * passed through verbatim rather than normalised, because the policy that reads
 * them is the one entitled to decide what they mean.
 */
export const UNKNOWN_COUNTRY = 'XX'
export const TOR_COUNTRY = 'T1'

export interface CountrySource {
	headers: Record<string, string | string[] | undefined>
}

/**
 * The country Cloudflare observed for this request, or `undefined` when it said
 * nothing. The only place the country signal is read, so swapping Cloudflare for
 * another source touches this function and nothing else.
 *
 * There is deliberately no fallback source: a guessed country is worse than an
 * absent one, since the caller can tell the difference only if we do not invent
 * it. Local development gets the real header by running behind the same tunnel
 * as production rather than by standing something in for it.
 *
 * The header is trusted, so this function is only sound while the origin is
 * unreachable except through Cloudflare: the gate publishes no public port and
 * is reached over a Cloudflare Tunnel, which `cloudflared` dials outward. Expose
 * this listener directly and anyone can hand it a `CF-IPCountry` of their
 * choosing, which silently defeats the country policy. See
 * `docs/adr/0003-declarative-eligibility-gate-accepted-risks.md`.
 */
export function requestCountry(request: CountrySource): string | undefined {
	const header = request.headers[COUNTRY_HEADER]

	const value = Array.isArray(header) ? header[0] : header

	if (value === undefined || value === '') return undefined

	return value
}
