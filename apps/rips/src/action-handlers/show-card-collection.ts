import { ripsControllerGetCardCollection } from '../../generated/api-client'
import { CardCollectionPage } from '../pages/content/play/card-collection'
import { Effect, EffectType, SessionData } from '../types'
import { parseStakeId } from '../validation/stake-id'

export async function showCardCollection(
	session: SessionData,
	payload: string | undefined,
): Promise<Effect> {
	const stakeId = parseStakeId(payload)

	const { data } = await ripsControllerGetCardCollection({
		headers: { 'x-telegram-id': session.telegramId },
		query: { stakeId },
	})

	return {
		type: EffectType.EDIT,
		page: CardCollectionPage.render(data),
	}
}
