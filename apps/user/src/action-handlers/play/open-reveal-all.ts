import {
	ripsControllerGetRips,
	ripsControllerRevealPayouts,
} from '@rips/api-client'
import { toReset } from '@rips/grammy-kit'
import { ActionDef, noPayload } from '../../action-def'
import { RevealAllPage } from '../../pages/play/reveal-all-page'
import { EffectType } from '../../types'
import { fetchUnrevealedPayouts } from '../../utils/api/wrappers'

export const openRevealAll: ActionDef<void> = noPayload(async (session) => {
	const { telegramId } = session

	const { data: revealData } = await ripsControllerRevealPayouts({
		headers: { 'x-telegram-id': telegramId },
		body: { revealAll: true },
	})

	const [unrevealedPayouts, { data: ripsData }] = await Promise.all([
		fetchUnrevealedPayouts(telegramId),
		ripsControllerGetRips({
			query: {
				ids: [...new Set(revealData.payouts.map((p) => p.ripId))],
			},
		}),
	])

	return {
		flow: toReset(),
		effect: {
			type: EffectType.EDIT,
			page: RevealAllPage.render(
				ripsData.rips,
				revealData.payouts,
				unrevealedPayouts,
			),
		},
	}
})
