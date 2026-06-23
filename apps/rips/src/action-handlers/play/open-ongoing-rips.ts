import {
	ripsControllerGetOngoingRips,
	ripsControllerGetPresets,
} from '@rips/api-client'
import { ActionDef, noPayload } from '../../action-def'
import { OngoingRipsPage } from '../../pages/play/ongoing-rips-page'
import { EffectType } from '../../types'

export const openOngoingRips: ActionDef<void> = noPayload(async () => {
	const [{ data: ripsData }, { data: presetsData }] = await Promise.all([
		ripsControllerGetOngoingRips(),
		ripsControllerGetPresets(),
	])

	return {
		type: EffectType.EDIT,
		page: OngoingRipsPage.render(
			ripsData.rips,
			presetsData.availablePresets,
		),
	}
})
