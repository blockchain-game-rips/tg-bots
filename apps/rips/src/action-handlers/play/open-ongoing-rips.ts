import {
	ripsControllerGetOngoingRips,
	ripsControllerGetPresets,
} from '@rips/api-client'
import { toReset } from '@rips/grammy-kit'
import { ActionDef, noPayload } from '../../action-def'
import { OngoingRipsPage } from '../../pages/play/ongoing-rips-page'
import { EffectType } from '../../types'

export const openOngoingRips: ActionDef<void> = noPayload(async () => {
	const [{ data: ripsData }, { data: presetsData }] = await Promise.all([
		ripsControllerGetOngoingRips(),
		ripsControllerGetPresets(),
	])

	return {
		flow: toReset(),
		effect: {
			type: EffectType.EDIT,
			page: OngoingRipsPage.render(
				ripsData.rips,
				presetsData.availablePresets,
			),
		},
	}
})
