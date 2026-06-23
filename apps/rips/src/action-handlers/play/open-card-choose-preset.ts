import { ActionDef, noPayload } from '../../action-def'
import { CardCollectionChoosePresetPage } from '../../pages/play/card-collection-choose-preset'
import { EffectType } from '../../types'
import { fetchPresets } from '../../utils/api/wrappers'

export const openCardChoosePreset: ActionDef<void> = noPayload(async () => {
	const availablePresets = await fetchPresets()

	return {
		type: EffectType.EDIT,
		page: CardCollectionChoosePresetPage.render(availablePresets),
	}
})
