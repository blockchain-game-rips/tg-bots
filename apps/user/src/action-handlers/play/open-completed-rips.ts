import { ripsControllerGetFinishedRips } from '@rips/api-client'
import { ActionDef, noPayload } from '../../action-def'
import { toReset } from '../../flows'
import { FinishedRipsPage } from '../../pages/play/finished-rips-page'
import { EffectType } from '../../types'

export const openCompletedRips: ActionDef<void> = noPayload(async () => {
	const { data } = await ripsControllerGetFinishedRips()

	return {
		flow: toReset(),
		effect: {
			type: EffectType.EDIT,
			page: FinishedRipsPage.render(data.rips),
		},
	}
})
