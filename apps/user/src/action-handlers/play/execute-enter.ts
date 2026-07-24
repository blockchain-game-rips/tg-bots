import {
	ripsControllerBuyEntriesPurchase,
	ripsControllerGetOngoingRips,
} from '@rips/api-client'
import { assertFlow, ErrorToRender } from '@rips/grammy-kit'
import { ActionDef, noPayload } from '../../action-def'
import { NATIVE_ON_BASE } from '../../constants'
import { toReset } from '../../flows'
import { EnterSuccessPage } from '../../pages/play/enter-success-page'
import { EffectType } from '../../types'
import { isApiErrorWithStatus } from '../../utils/api/error'

const TRANSACTION_REVERTED_STATUS = 502

export const executeEnter: ActionDef<void> = noPayload(async (session) => {
	assertFlow(session, 'enter', 'entry-count-chosen')
	const { presetId, entryCount } = session.flow.data

	const { data: purchase } = await ripsControllerBuyEntriesPurchase({
		headers: { 'x-telegram-id': session.telegramId },
		body: {
			presetId,
			entryCount,
			paymentCurrencyChainAddress: NATIVE_ON_BASE,
		},
	}).catch((error: unknown) => {
		if (isApiErrorWithStatus(error, TRANSACTION_REVERTED_STATUS)) {
			throw new ErrorToRender(error.message)
		}

		throw error
	})

	const { data: ripsData } = await ripsControllerGetOngoingRips()

	const rip = ripsData.rips.find((r) => r.id === purchase.ripId)

	return {
		flow: toReset(),
		effect: {
			type: EffectType.EDIT,
			page: EnterSuccessPage.render(purchase, rip),
		},
	}
})
