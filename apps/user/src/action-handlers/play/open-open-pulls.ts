import { ActionDef, noPayload } from '../../action-def'
import { toReset } from '../../flows'
import {
	RevealPayoutsNoBackPage,
	RevealPayoutsPage,
} from '../../pages/play/reveal-payouts-page'
import { EffectType } from '../../types'
import { fetchUnrevealedPayouts } from '../../utils/api/wrappers'

export const openOpenPulls: ActionDef<void> = noPayload(async (session) => {
	const unrevealedPayouts = await fetchUnrevealedPayouts(session.telegramId)

	return {
		flow: toReset(),
		effect: {
			type: EffectType.NAVIGATE,
			page: RevealPayoutsPage.render(unrevealedPayouts.length),
		},
	}
})

export const openOpenPullsNoBack: ActionDef<void> = noPayload(
	async (session) => {
		const unrevealedPayouts = await fetchUnrevealedPayouts(
			session.telegramId,
		)

		return {
			flow: toReset(),
			effect: {
				type: EffectType.NAVIGATE,
				page: RevealPayoutsNoBackPage.render(unrevealedPayouts.length),
			},
		}
	},
)
