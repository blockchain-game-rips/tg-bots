import {
	ripsControllerBuyEntriesPurchase,
	ripsControllerGetOngoingRips,
} from '@rips/api-client'
import { assertFlow, ErrorToRender, resetFlow } from '@rips/grammy-kit'
import { ActionDef, noPayload } from '../../action-def'
import { NATIVE_ON_BASE } from '../../constants'
import { BuySuccessPage } from '../../pages/play/buy-success-page'
import { EffectType } from '../../types'
import { isApiErrorWithStatus } from '../../utils/api/error'

const TRANSACTION_REVERTED_STATUS = 502

export const executeBuyEntries: ActionDef<void> = noPayload(async (session) => {
	assertFlow(session, 'buyEntries', 'entry-count-chosen')
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

	resetFlow(session)

	return {
		type: EffectType.EDIT,
		page: BuySuccessPage.render(purchase, rip),
	}
})
