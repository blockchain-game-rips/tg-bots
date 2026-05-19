import { ripsControllerGetCardCollection } from '@rips/api-client'
import { ActionDef, withPayload } from '../../action-def'
import { CardCollectionPage } from '../../pages/play/card-collection'
import { EffectType } from '../../types'
import { parseStakeId } from '../../validation/stake-id'

export const openCardCollection: ActionDef<number> = withPayload(
	(stakeId) => stakeId.toString(),
	(raw) => parseStakeId(raw),
	async (session, stakeId) => {
		const { data } = await ripsControllerGetCardCollection({
			headers: { 'x-telegram-id': session.telegramId },
			query: { stakeId },
		})

		return {
			type: EffectType.EDIT,
			page: CardCollectionPage.render(data),
		}
	},
)
