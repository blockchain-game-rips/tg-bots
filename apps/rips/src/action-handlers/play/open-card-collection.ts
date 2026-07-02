import { ripsControllerGetCardCollection } from '@rips/api-client'
import { ActionDef, noPayload } from '../../action-def'
import { CardCollectionPage } from '../../pages/play/card-collection'
import { EffectType } from '../../types'

export const openCardCollection: ActionDef<void> = noPayload(
	async (session) => {
		const { data } = await ripsControllerGetCardCollection({
			headers: { 'x-telegram-id': session.telegramId },
		})

		return {
			type: EffectType.EDIT,
			page: CardCollectionPage.render(data),
		}
	},
)
