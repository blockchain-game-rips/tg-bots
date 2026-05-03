import { ripsControllerGetPrizes } from '../../../generated/api-client'
import { RevealPrizesPage } from '../../pages/play/reveal-prizes-page'
import { Effect, EffectType, SessionData } from '../../types'

export async function openRevealPrizes(
	session: SessionData,
	_payload: string | undefined,
): Promise<Effect> {
	const { telegramId } = session

	const { data: prizesData } = await ripsControllerGetPrizes({
		headers: { 'x-telegram-id': telegramId },
	})

	const unrevealedPrizes = prizesData.prizes.filter((p) => !p.revealed)

	return {
		type: EffectType.EDIT,
		page: RevealPrizesPage.render(unrevealedPrizes),
	}
}
