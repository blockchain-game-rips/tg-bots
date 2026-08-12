import {
	ripsControllerGetOngoingRips,
	ripsControllerGetPresets,
} from '@rips/api-client'
import { ActionDef, noPayload } from '../../action-def'
import { toReset } from '../../flows'
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
			type: EffectType.NAVIGATE,
			page: OngoingRipsPage.render({
				availablePresets: presetsData.availablePresets,
				ongoingRips: ripsData.rips,
			}),
		},
	}
})
