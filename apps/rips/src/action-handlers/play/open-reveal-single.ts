import {
	ripsControllerGetRips,
	ripsControllerRevealPayouts,
} from '@rips/api-client'
import { ActionDef, noPayload } from '../../action-def'
import { RevealSinglePage } from '../../pages/play/reveal-single-page'
import { EffectType } from '../../types'
import { fetchUnrevealedPayouts } from '../../utils/api/wrappers'

export const openRevealSingle: ActionDef<void> = noPayload(async (session) => {
	const { telegramId } = session

	const { data: revealData } = await ripsControllerRevealPayouts({
		headers: { 'x-telegram-id': telegramId },
		body: { revealAll: false },
	})

	const [unrevealedPayouts, { data: ripsData }] = await Promise.all([
		fetchUnrevealedPayouts(telegramId),
		ripsControllerGetRips({
			query: {
				ids: [...new Set(revealData.payouts.map((p) => p.ripId))],
			},
		}),
	])

	const revealedPayout = revealData.payouts[0]
	const rip = ripsData.rips[0]

	if (rip === undefined) throw new Error('Rip not found')
	if (revealedPayout === undefined)
		throw new Error('Revealed payout not found')

	return {
		type: EffectType.EDIT,
		page: RevealSinglePage.render(rip, revealedPayout, unrevealedPayouts),
	}
})
