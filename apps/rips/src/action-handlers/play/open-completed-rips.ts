import { ripsControllerGetCompletedRips } from '@rips/api-client'
import { toReset } from '@rips/grammy-kit'
import { ActionDef, noPayload } from '../../action-def'
import { FinishedRipsPage } from '../../pages/play/finished-rips-page'
import { EffectType } from '../../types'

export const openCompletedRips: ActionDef<void> = noPayload(async () => {
	const { data } = await ripsControllerGetCompletedRips()

	return {
		flow: toReset(),
		effect: {
			type: EffectType.EDIT,
			page: FinishedRipsPage.render(data.rips),
		},
	}
})
