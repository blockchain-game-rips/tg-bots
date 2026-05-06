import { ripsControllerGetPrizes } from '../../../generated/api-client'
import { ActionDef, noPayload } from '../../action-def'
import { RevealPrizesPage } from '../../pages/play/reveal-prizes-page'
import { EffectType } from '../../types'

export const openRevealPrizes: ActionDef<void> = noPayload(async (session) => {
	const { data: prizesData } = await ripsControllerGetPrizes({
		headers: { 'x-telegram-id': session.telegramId },
	})

	const unrevealedPrizes = prizesData.prizes.filter((p) => !p.revealed)

	return {
		type: EffectType.EDIT,
		page: RevealPrizesPage.render(unrevealedPrizes),
	}
})
