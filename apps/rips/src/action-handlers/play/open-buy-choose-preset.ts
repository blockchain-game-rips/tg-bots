import { ActionDef, noPayload } from '../../action-def'
import { BuyChoosePresetPage } from '../../pages/play/buy-choose-preset-page'
import { EffectType } from '../../types'
import { fetchPresets } from '../../utils/api/wrappers'

export const openBuyChoosePreset: ActionDef<void> = noPayload(async () => {
	const availablePresets = await fetchPresets()

	return {
		type: EffectType.EDIT,
		page: BuyChoosePresetPage.render(availablePresets),
	}
})
