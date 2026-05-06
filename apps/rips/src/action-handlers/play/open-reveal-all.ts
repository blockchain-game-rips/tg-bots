import {
	ripsControllerGetPrizes,
	ripsControllerGetRounds,
	ripsControllerRevealPrizes,
} from '../../../generated/api-client'
import { ActionDef, noPayload } from '../../action-def'
import { RevealAllPage } from '../../pages/play/reveal-all-page'
import { EffectType } from '../../types'

export const openRevealAll: ActionDef<void> = noPayload(async (session) => {
	const { telegramId } = session

	const { data: revealData } = await ripsControllerRevealPrizes({
		headers: { 'x-telegram-id': telegramId },
		body: { revealAll: true },
	})

	const { data: prizesData } = await ripsControllerGetPrizes({
		headers: { 'x-telegram-id': telegramId },
	})

	const unrevealedPrizes = prizesData.prizes.filter((p) => !p.revealed)
	const roundIds = [...new Set(revealData.prizes.map((p) => p.roundId))]

	const { data: roundsData } = await ripsControllerGetRounds({
		query: { ids: roundIds },
	})

	return {
		type: EffectType.EDIT,
		page: RevealAllPage.render(
			roundsData.rounds,
			revealData.prizes,
			unrevealedPrizes,
		),
	}
})
