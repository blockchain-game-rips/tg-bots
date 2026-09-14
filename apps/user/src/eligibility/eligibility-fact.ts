import { EligibilityPolicyCache } from '../cache/eligibility-policy-cache'
import { EligibilityFact } from '../gate'
import { isCountryBlocked } from './verdict'

interface EligibilityFactHandlerOptions {
	policyCache: Pick<EligibilityPolicyCache, 'get'>

	record: (
		telegramId: number,
		country: string,
		termsVersion: number,
	) => Promise<unknown>

	invalidate: (telegramId: number) => Promise<void>

	/** Drives the bot from an event, landing a page in the user's chat. */
	deliver: (event: {
		telegramId: number
		action: { actionId: string; payload: string | undefined }
	}) => Promise<void>

	homeActionId: string
	blockedActionId: string
}

/**
 * What becomes of the fact the gate reports: the verdict against the policy, the
 * write, and the page the user is waiting for.
 *
 * The country is the one just observed rather than anything stored, so a user
 * who has moved is judged where they are now. The terms version is the bot's own
 * read of the policy — never the caller's — which is what keeps it out of the
 * mini app's untrusted input, at the cost of one accepted race if an admin bumps
 * the version in the same instant.
 *
 * A blocked country writes nothing: there is no acceptance to record for a user
 * who may not play, and a record would only have to be undone.
 */
export function buildEligibilityFactHandler({
	policyCache,
	record,
	invalidate,
	deliver,
	homeActionId,
	blockedActionId,
}: EligibilityFactHandlerOptions): (fact: EligibilityFact) => Promise<void> {
	return async function handleFact({ telegramId, country }) {
		const policy = await policyCache.get()

		if (isCountryBlocked(country, policy)) {
			await deliver({
				telegramId,
				action: { actionId: blockedActionId, payload: undefined },
			})

			return
		}

		await record(telegramId, country, policy.termsVersion)

		// Before the page, or home would render from the record this write
		// just replaced and send the user straight back to the gate.
		await invalidate(telegramId)

		await deliver({
			telegramId,
			action: { actionId: homeActionId, payload: undefined },
		})
	}
}
