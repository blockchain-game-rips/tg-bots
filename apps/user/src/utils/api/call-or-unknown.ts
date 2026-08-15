/**
 * A thrown call never yields a status, and a timeout is indistinguishable from
 * a signed transaction whose response was lost, so both are reported as unknown
 * rather than as a failure that never left.
 */
export async function callOrUnknown<T>(
	call: () => Promise<T>,
): Promise<T | null> {
	try {
		return await call()
	} catch {
		return null
	}
}
