import { ActionDef, noPayload } from '../action-def'
import { toReset } from '../flows'
import { BlockedPage } from '../pages/eligibility/blocked-page'
import { EffectType } from '../types'

/**
 * The region refusal as a landing of its own, named only by the gate path — a
 * pressed action never reaches it, because a press is a fresh gesture from a
 * user who may since have moved and belongs on the consent page instead.
 *
 * The trail is cleared: the refusal is where the flow ends, and there is
 * nothing behind it worth returning to.
 */
export const openEligibilityBlocked: ActionDef<void> = noPayload(() => ({
	flow: toReset(),
	effect: {
		type: EffectType.NAVIGATE,
		page: BlockedPage.render(),
		history: { clears: true },
	},
}))
