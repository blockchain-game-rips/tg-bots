import {
	ripsControllerGetPrizes,
	ripsControllerGetRounds,
	ripsControllerRevealPrizes,
} from '../../../generated/api-client'
import { ActionDef, noPayload } from '../../action-def'
import { RevealSinglePage } from '../../pages/play/reveal-single-page'
import { EffectType } from '../../types'

export const openRevealSingle: ActionDef<void> = noPayload(async (session) => {
	const { telegramId } = session

	const { data: revealData } = await ripsControllerRevealPrizes({
		headers: { 'x-telegram-id': telegramId },
		body: { revealAll: false },
	})

	const { data: prizesData } = await ripsControllerGetPrizes({
		headers: { 'x-telegram-id': telegramId },
	})

	const unrevealedPrizes = prizesData.prizes.filter((p) => !p.revealed)
	const roundIds = [...new Set(revealData.prizes.map((p) => p.roundId))]

	const { data: roundsData } = await ripsControllerGetRounds({
		query: { ids: roundIds },
	})

	const revealedPrize = revealData.prizes[0]
	const round = roundsData.rounds[0]

	return {
		type: EffectType.EDIT,
		page: RevealSinglePage.render(round, revealedPrize, unrevealedPrizes),
	}
})
