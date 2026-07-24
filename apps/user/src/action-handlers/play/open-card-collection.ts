import { ActionDef, noPayload } from '../../action-def'
import { toReset } from '../../flows'
import { CardCollectionPage } from '../../pages/play/card-collection'
import { EffectType } from '../../types'
import { fetchCardCollection } from '../../utils/api/wrappers'

export const openCardCollection: ActionDef<void> = noPayload(
	async (session) => {
		const collection = await fetchCardCollection(session.telegramId)

		return {
			flow: toReset(),
			effect: {
				type: EffectType.EDIT,
				page: CardCollectionPage.render(collection),
			},
		}
	},
)
