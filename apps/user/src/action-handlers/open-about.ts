import { ActionDef, noPayload } from '../action-def'
import { toReset } from '../flows'
import { AboutPage } from '../pages/about/about-page'
import { EffectType } from '../types'
import { fetchPresets } from '../utils/api/wrappers'

export const openAbout: ActionDef<void> = noPayload(async () => {
	const availablePresets = await fetchPresets()

	return {
		flow: toReset(),
		effect: {
			type: EffectType.NAVIGATE,
			page: AboutPage.render(availablePresets),
		},
	}
})
