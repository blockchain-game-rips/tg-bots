import { AnyHandlerResult } from '@rips/grammy-kit'
import { EligibilityPolicyCache } from '../cache/eligibility-policy-cache'
import { UserEligibilityCache } from '../cache/user-eligibility-cache'
import { EligibilityCheck } from '../gated-registry'
import { hasAcceptedCurrentTerms } from './terms-acceptance'

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
 * Builds the check the gated registry consults. Refuses a user who has not
 * accepted the current terms; everyone else proceeds untouched.
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

		if (hasAcceptedCurrentTerms(eligibility, policy.termsVersion)) {
			return undefined
		}

		return renderRefusal()
	}
}
