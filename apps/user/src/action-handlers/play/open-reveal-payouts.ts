import { ActionDef, noPayload } from '../../action-def'
import { toReset } from '../../flows'
import { RevealPayoutsPage } from '../../pages/play/reveal-payouts-page'
import { EffectType } from '../../types'
import { fetchUnrevealedPayouts } from '../../utils/api/wrappers'

export const openRevealPayouts: ActionDef<void> = noPayload(async (session) => {
	const unrevealedPayouts = await fetchUnrevealedPayouts(session.telegramId)

	return {
		flow: toReset(),
		effect: {
			type: EffectType.EDIT,
			page: RevealPayoutsPage.render(unrevealedPayouts.length),
		},
	}
})
