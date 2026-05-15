import {
	ripsControllerGetRounds,
	ripsControllerRevealPrizes,
} from '../../../generated/api-client'
import { ActionDef, noPayload } from '../../grammy-kit/action/action-def'
import { RevealAllPage } from '../../pages/play/reveal-all-page'
import { EffectType } from '../../types'
import { fetchUnrevealedPrizes } from '../../utils/api/wrappers'

export const openRevealAll: ActionDef<void> = noPayload(async (session) => {
	const { telegramId } = session

	const { data: revealData } = await ripsControllerRevealPrizes({
		headers: { 'x-telegram-id': telegramId },
		body: { revealAll: true },
	})

	const [unrevealedPrizes, { data: roundsData }] = await Promise.all([
		fetchUnrevealedPrizes(telegramId),
		ripsControllerGetRounds({
			query: {
				ids: [...new Set(revealData.prizes.map((p) => p.roundId))],
			},
		}),
	])

	return {
		type: EffectType.EDIT,
		page: RevealAllPage.render(
			roundsData.rounds,
			revealData.prizes,
			unrevealedPrizes,
		),
	}
})
