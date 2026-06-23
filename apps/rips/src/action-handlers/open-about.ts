import { ActionDef, noPayload } from '../action-def'
import { AboutPage } from '../pages/about/about-page'
import { EffectType } from '../types'
import { fetchPresets } from '../utils/api/wrappers'

export const openAbout: ActionDef<void> = noPayload(async () => {
	const availablePresets = await fetchPresets()

	const configs = availablePresets
		.map((s) => s.fillingRip?.config ?? s.preset.currentConfig)
		.filter((config) => config !== null)

	return { type: EffectType.EDIT, page: AboutPage.render(configs) }
})
