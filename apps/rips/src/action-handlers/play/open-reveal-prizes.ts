import { ActionDef, noPayload } from '../../action-def'
import { RevealPrizesPage } from '../../pages/play/reveal-prizes-page'
import { EffectType } from '../../types'
import { fetchUnrevealedPrizes } from '../../utils/api'

export const openRevealPrizes: ActionDef<void> = noPayload(async (session) => {
	const unrevealedPrizes = await fetchUnrevealedPrizes(session.telegramId)

	return {
		type: EffectType.EDIT,
		page: RevealPrizesPage.render(unrevealedPrizes),
	}
})
