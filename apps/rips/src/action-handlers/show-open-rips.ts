import { ripsControllerGetPrizes } from '../../generated/api-client'
import { RevealPrizesPage } from '../pages/content/play/reveal-prizes-page'
import { Effect, EffectType, SessionData } from '../types'

export async function showOpenRips(
	session: SessionData,
	_payload: string | undefined,
): Promise<Effect> {
	const { data } = await ripsControllerGetPrizes({
		headers: { 'x-telegram-id': session.telegramId },
		throwOnError: true,
	})

	const unrevealedPrizes = data.prizes.filter((p) => !p.revealed)

	return {
		type: EffectType.EDIT,
		page: RevealPrizesPage.render([], unrevealedPrizes),
	}
}
