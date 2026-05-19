import { ActionDef, noPayload } from '../../action-def'
import {
	RevealPrizesNoBackPage,
	RevealPrizesPage,
} from '../../pages/play/reveal-prizes-page'
import { EffectType } from '../../types'
import { fetchUnrevealedPrizes } from '../../utils/api/wrappers'

export const openOpenRips: ActionDef<void> = noPayload(async (session) => {
	const unrevealedPrizes = await fetchUnrevealedPrizes(session.telegramId)

	return {
		type: EffectType.EDIT,
		page: RevealPrizesPage.render(unrevealedPrizes),
	}
})

export const openOpenRipsNoBack: ActionDef<void> = noPayload(
	async (session) => {
		const unrevealedPrizes = await fetchUnrevealedPrizes(session.telegramId)

		return {
			type: EffectType.EDIT,
			page: RevealPrizesNoBackPage.render(unrevealedPrizes),
		}
	},
)
