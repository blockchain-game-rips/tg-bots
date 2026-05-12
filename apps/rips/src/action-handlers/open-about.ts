import { ripsControllerGetStakes } from '../../generated/api-client'
import { ActionDef, noPayload } from '../action-def'
import { AboutPage } from '../pages/about/about-page'
import { EffectType } from '../types'

export const openAbout: ActionDef<void> = noPayload(async () => {
	const { data } = await ripsControllerGetStakes()

	const configs = data.availableStakes
		.map((s) => s.fillingRound?.config ?? s.stake.currentConfig)
		.filter((c): c is NonNullable<typeof c> => c != null)

	return { type: EffectType.EDIT, page: AboutPage.render(configs) }
})
