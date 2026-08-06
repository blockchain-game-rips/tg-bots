import { resolveConfig } from '@rips/shared'
import { ActionDef, noPayload } from '../action-def'
import { toReset } from '../flows'
import { AboutPage } from '../pages/about/about-page'
import { EffectType } from '../types'
import { fetchPresets } from '../utils/api/wrappers'

export const openAbout: ActionDef<void> = noPayload(async () => {
	const availablePresets = await fetchPresets()

	const configs = availablePresets.map(resolveConfig)

	return {
		flow: toReset(),
		effect: { type: EffectType.EDIT, page: AboutPage.render(configs) },
	}
})
