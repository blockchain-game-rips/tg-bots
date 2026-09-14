import { AnyHandlerResult } from '@rips/grammy-kit'
import { EligibilityPolicyCache } from '../cache/eligibility-policy-cache'
import { UserEligibilityCache } from '../cache/user-eligibility-cache'
import { EligibilityCheck } from '../gated-registry'
import { verdict } from './verdict'

interface EligibilityCheckOptions {
	policyCache: Pick<EligibilityPolicyCache, 'get'>
	userCache: Pick<UserEligibilityCache, 'get'>

	/**
	 * What a refused user sees instead of the action they pressed. Supplied
	 * rather than imported so the check owns the verdict and nothing else —
	 * the wrapper never learns why a press was refused.
	 */
	renderRefusal: () => Promise<AnyHandlerResult> | AnyHandlerResult
}

/**
 * Builds the check the gated registry consults. Every refusal ends on the same
 * page, whatever the verdict's reason: a press is a fresh gesture, and a user
 * whose country was blocked may since have moved, so re-running the flow — which
 * the consent page's Agree button starts — is the way out rather than a dead
 * end. The visible country refusal belongs to the gate path, which has just
 * observed where the user is.
 *
 * Both reads go through their caches, so a warm press costs no request. A
 * backend failure is left to propagate: the gate adds no branch of its own.
 */
export function buildEligibilityCheck({
	policyCache,
	userCache,
	renderRefusal,
}: EligibilityCheckOptions): EligibilityCheck {
	return async ({ telegramId }) => {
		const [policy, eligibility] = await Promise.all([
			policyCache.get(),
			userCache.get(telegramId),
		])

		const refusalReason = verdict(
			eligibility?.country,
			eligibility?.termsVersion,
			policy,
		)

		if (refusalReason === undefined) return undefined

		return renderRefusal()
	}
}
