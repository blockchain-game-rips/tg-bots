/**
 * Parses JSON that arrived from outside, yielding `undefined` rather than
 * throwing. The result is `unknown` on purpose: the caller has to narrow it,
 * since nothing about untrusted text guarantees the documented shape.
 */
export function tryParseJson(raw: string): unknown {
	try {
		return JSON.parse(raw)
	} catch {
		return undefined
	}
}
