import { ActionDef, noPayload } from '../grammy-kit/action/action-def'
import { AboutPage } from '../pages/about/about-page'
import { EffectType } from '../types'
import { fetchStakes } from '../utils/api'

export const openAbout: ActionDef<void> = noPayload(async () => {
	const availableStakes = await fetchStakes()

	const configs = availableStakes
		.map((s) => s.fillingRound?.config ?? s.stake.currentConfig)
		.filter((config) => config !== null)

	return { type: EffectType.EDIT, page: AboutPage.render(configs) }
})
