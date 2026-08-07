import { assertFlow } from '@rips/grammy-kit'
import { ActionDef, noPayload } from '../../../action-def'
import { nativeChainAddress, SUPPORTED_CHAINS } from '../../../constants'
import { toStep } from '../../../flows'
import { EnterChoosePaymentWalletPage } from '../../../pages/play/enter-choose-payment-wallet-page'
import { EffectType } from '../../../types'
import { fetchBalances } from '../../../utils/api/wrappers'

export const openEnterChoosePaymentWallet: ActionDef<void> = noPayload(
	async (session) => {
		assertFlow(session, 'enter', 'choosing-payment-token', 'at-checkout')

		const { availablePreset, entryCount } = session.flow.data

		const balances = await fetchBalances(
			session.telegramId,
			SUPPORTED_CHAINS.map((chain) => nativeChainAddress(chain)),
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
				page: EnterChoosePaymentWalletPage.render({
					availablePreset,
					entryCount,
					balances,
				}),
			},
		}
	},
)
