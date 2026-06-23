import { ripsControllerGetCompletedRips } from '@rips/api-client'
import { ActionDef, noPayload } from '../../action-def'
import { FinishedRipsPage } from '../../pages/play/finished-rips-page'
import { EffectType } from '../../types'

export const openCompletedRips: ActionDef<void> = noPayload(async () => {
	const { data } = await ripsControllerGetCompletedRips()

	return {
		type: EffectType.EDIT,
		page: FinishedRipsPage.render(data.rips),
	}
})
