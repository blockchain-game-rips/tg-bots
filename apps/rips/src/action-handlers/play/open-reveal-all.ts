import {
	ripsControllerGetPrizes,
	ripsControllerGetRounds,
	ripsControllerRevealPrizes,
} from '../../../generated/api-client'
import { RevealAllPage } from '../../pages/play/reveal-all-page'
import { Effect, EffectType, SessionData } from '../../types'

export async function openRevealAll(
	session: SessionData,
	_payload: string | undefined,
): Promise<Effect> {
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
}
