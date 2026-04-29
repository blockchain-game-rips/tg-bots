import {
	ripsControllerGetPrizes,
	ripsControllerGetRounds,
	ripsControllerRevealPrizes,
} from '../../../generated/api-client'
import {
	REVEAL_ALL_PAYLOAD,
	REVEAL_ONE_PAYLOAD,
	RevealPrizesPage,
} from '../../pages/play/reveal-prizes-page'
import { Effect, EffectType, SessionData } from '../../types'

export async function showRevealPrizes(
	session: SessionData,
	payload: string | undefined,
): Promise<Effect> {
	const { telegramId } = session

	if (payload === REVEAL_ONE_PAYLOAD || payload === REVEAL_ALL_PAYLOAD) {
		const revealAll = payload === REVEAL_ALL_PAYLOAD

		const { data: revealData } = await ripsControllerRevealPrizes({
			headers: { 'x-telegram-id': telegramId },
			body: { revealAll },
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
			page: RevealPrizesPage.render(roundsData.rounds, unrevealedPrizes),
		}
	}

	const { data: prizesData } = await ripsControllerGetPrizes({
		headers: { 'x-telegram-id': telegramId },
	})

	const unrevealedPrizes = prizesData.prizes.filter((p) => !p.revealed)

	return {
		type: EffectType.EDIT,
		page: RevealPrizesPage.render([], unrevealedPrizes),
	}
}
