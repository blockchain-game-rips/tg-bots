import { ActionDef, withPayload } from '../../action-def'
import { findTier } from '../../domain/card-collection'
import { toReset } from '../../flows'
import { CardCollectionTierPage } from '../../pages/play/card-collection-tier'
import { EffectType } from '../../types'
import { fetchCardCollection } from '../../utils/api/wrappers'
import { tierIndexCodec } from '../../utils/tiers'

export const openCardCollectionTier: ActionDef<number> = withPayload(
	tierIndexCodec,
	async (session, tierIndex) => {
		const collection = await fetchCardCollection(session.telegramId)

		const tierCollection = findTier(collection, tierIndex)

		if (tierCollection === undefined) throw new Error('Unknown card tier')

		return {
			flow: toReset(),
			effect: {
				type: EffectType.NAVIGATE,
				page: CardCollectionTierPage.render(tierCollection),
			},
		}
	},
)
