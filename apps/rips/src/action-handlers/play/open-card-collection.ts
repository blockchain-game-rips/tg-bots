import { ripsControllerGetCardCollection } from '@rips/api-client'
import { parsePresetId } from '@rips/shared'
import { ActionDef, withPayload } from '../../action-def'
import { CardCollectionPage } from '../../pages/play/card-collection'
import { EffectType } from '../../types'

export const openCardCollection: ActionDef<number> = withPayload(
	(presetId) => presetId.toString(),
	(raw) => parsePresetId(raw),
	async (session, presetId) => {
		const { data } = await ripsControllerGetCardCollection({
			headers: { 'x-telegram-id': session.telegramId },
			query: { presetId },
		})

		return {
			type: EffectType.EDIT,
			page: CardCollectionPage.render(data),
		}
	},
)
