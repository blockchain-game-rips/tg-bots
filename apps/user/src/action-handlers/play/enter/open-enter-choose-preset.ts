import { ActionDef, noPayload } from '../../../action-def'
import { toReset } from '../../../flows'
import { EnterChoosePresetPage } from '../../../pages/play/enter-choose-preset-page'
import { EffectType } from '../../../types'
import { fetchPresets } from '../../../utils/api/wrappers'

export const openEnterChoosePreset: ActionDef<void> = noPayload(async () => {
	const availablePresets = await fetchPresets()

	return {
		flow: toReset(),
		effect: {
			type: EffectType.EDIT,
			page: EnterChoosePresetPage.render(availablePresets),
		},
	}
})
