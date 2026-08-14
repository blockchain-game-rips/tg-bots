import { ActionDef, noPayload } from '../../../action-def'
import { toReset } from '../../../flows'
import { EnterChoosePresetPage } from '../../../pages/play/enter-choose-preset-page'
import { EffectType } from '../../../types'
import { presetCache } from '../../../cache/preset-cache'

export const openEnterChoosePreset: ActionDef<void> = noPayload(async () => {
	const availablePresets = await presetCache.getAll()

	return {
		flow: toReset(),
		effect: {
			type: EffectType.NAVIGATE,
			page: EnterChoosePresetPage.render(availablePresets),
		},
	}
})
