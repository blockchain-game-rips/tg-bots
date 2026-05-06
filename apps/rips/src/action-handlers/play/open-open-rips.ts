import { ripsControllerGetPrizes } from '../../../generated/api-client'
import {
	RevealPrizesNoBackPage,
	RevealPrizesPage,
} from '../../pages/play/reveal-prizes-page'
import { Effect, EffectType, SessionData } from '../../types'

async function fetchUnrevealedPrizes(telegramId: string) {
	const { data } = await ripsControllerGetPrizes({
		headers: { 'x-telegram-id': telegramId },
	})

	return data.prizes.filter((p) => !p.revealed)
}

export async function openOpenRips(
	session: SessionData,
	_payload: string | undefined,
): Promise<Effect> {
	const unrevealedPrizes = await fetchUnrevealedPrizes(session.telegramId)

	return {
		type: EffectType.EDIT,
		page: RevealPrizesPage.render(unrevealedPrizes),
	}
}

export async function openOpenRipsNoBack(
	session: SessionData,
	_payload: string | undefined,
): Promise<Effect> {
	const unrevealedPrizes = await fetchUnrevealedPrizes(session.telegramId)

	return {
		type: EffectType.EDIT,
		page: RevealPrizesNoBackPage.render(unrevealedPrizes),
	}
}
