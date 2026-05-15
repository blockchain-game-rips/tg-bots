import {
	ripsControllerGetRounds,
	ripsControllerRevealPrizes,
} from '../../../generated/api-client'
import { ActionDef, noPayload } from '../../grammy-kit/action/action-def'
import { RevealSinglePage } from '../../pages/play/reveal-single-page'
import { EffectType } from '../../types'
import { fetchUnrevealedPrizes } from '../../utils/api/wrappers'

export const openRevealSingle: ActionDef<void> = noPayload(async (session) => {
	const { telegramId } = session

	const { data: revealData } = await ripsControllerRevealPrizes({
		headers: { 'x-telegram-id': telegramId },
		body: { revealAll: false },
	})

	const [unrevealedPrizes, { data: roundsData }] = await Promise.all([
		fetchUnrevealedPrizes(telegramId),
		ripsControllerGetRounds({
			query: {
				ids: [...new Set(revealData.prizes.map((p) => p.roundId))],
			},
		}),
	])

	const revealedPrize = revealData.prizes[0]
	const round = roundsData.rounds[0]

	if (round === undefined) throw new Error('Round not found')
	if (revealedPrize === undefined) throw new Error('Revealed prize not found')

	return {
		type: EffectType.EDIT,
		page: RevealSinglePage.render(round, revealedPrize, unrevealedPrizes),
	}
})
