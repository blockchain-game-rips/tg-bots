import { buildActions } from '@rips/grammy-kit'
import { actionIds } from './action-ids'
import { actionRegistry } from './action-registry'
import { eligibilityPolicyCache } from './cache/eligibility-policy-cache'
import { userEligibilityCache } from './cache/user-eligibility-cache'
import { buildEligibilityCheck } from './eligibility/eligibility-check'
import { renderRefusal } from './eligibility/refusal-page'
import { buildGatedRegistry } from './gated-registry'

/**
 * Every action is gated before it is bound, so deny-by-default is structural:
 * an action added later is covered because the wrapper covers the registry, and
 * there is no exception list to forget to update.
 */
const gatedRegistry = buildGatedRegistry<typeof actionIds>(
	actionRegistry,
	buildEligibilityCheck({
		policyCache: eligibilityPolicyCache,
		userCache: userEligibilityCache,
		renderRefusal,
	}),
)

/** What every user gesture runs through: a press is always checked first. */
export const actions = buildActions(actionIds, gatedRegistry)

/**
 * What the gate path delivers through, and the only entrance that skips the
 * check — because the verdict has just been computed against a freshly observed
 * country, and re-reading the stored record here would replace the page that
 * verdict chose. Running the guard again is what makes a region refusal
 * unreachable: it bounces the blocked user back to the consent page, the
 * silent return to step one the flow exists to avoid.
 *
 * Safe precisely because nothing user-supplied reaches it — the gate names the
 * action, never the caller.
 */
export const ungatedActions = buildActions(actionIds, actionRegistry)
