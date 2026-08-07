import { assertFlow } from '@rips/grammy-kit'
import { ActionDef, noPayload } from '../../../action-def'
import { SUPPORTED_CURRENCIES } from '../../../constants'
import { toStep } from '../../../flows'
import { EnterPaymentOptionsPage } from '../../../pages/play/enter-payment-options-page'
import { EffectType } from '../../../types'
import { fetchBalances } from '../../../utils/api/wrappers'

export const openEnterPaymentOptions: ActionDef<void> = noPayload(
	async (session) => {
		assertFlow(session, 'enter', 'choosing-payment-token', 'at-checkout')

		const { availablePreset, entryCount } = session.flow.data

		const balances = await fetchBalances(
			session.telegramId,
			SUPPORTED_CURRENCIES,
		)

		const flow = toStep(session.flow, 'choosing-payment-token', {
			availablePreset,
			entryCount,
			balances,
		})

		return {
			flow,
			effect: {
				type: EffectType.EDIT,
				page: EnterPaymentOptionsPage.render({
					availablePreset,
					entryCount,
					balances,
				}),
			},
		}
	},
)
