import { ActionDef, noPayload } from '../action-def'
import { toReset } from '../flows'
import { AboutPage } from '../pages/about/about-page'
import { EffectType } from '../types'
import { presetCache } from '../cache/preset-cache'

export const openAbout: ActionDef<void> = noPayload(async () => {
	const availablePresets = await presetCache.getAll()

	return {
		flow: toReset(),
		effect: {
			type: EffectType.NAVIGATE,
			page: AboutPage.render(availablePresets),
		},
	}
})
