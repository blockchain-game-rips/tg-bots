import { walletsControllerCreateWithdrawal } from '../../../generated/api-client'
import { ActionDef, noPayload } from '../../grammy-kit/action/action-def'
import { assertFlow, resetFlow } from '../../grammy-kit/session/session-utils'
import { WithdrawSuccessPage } from '../../pages/wallet/withdraw-success-page'
import { EffectType } from '../../types'
import { toCurrencyAmount } from '../../utils/currency'

export const executeWithdraw: ActionDef<void> = noPayload(async (session) => {
	assertFlow(session, 'withdraw', 'currency-chosen')

	const { currency, amount, recipientAddress } = session.flow.data

	if (amount === undefined || recipientAddress === undefined) {
		throw new Error(
			'Amount and recipient are required to confirm withdrawal',
		)
	}

	const currencyAmount = toCurrencyAmount(amount, currency)

	const { data: withdrawResult } = await walletsControllerCreateWithdrawal({
		headers: { 'x-telegram-id': session.telegramId },
		body: {
			amountIn: {
				amount: amount.toString(),
				currencyChainAddress: currency.chainAddress,
			},
			currencyOutChainAddress: currency.chainAddress,
			recipientAddress,
		},
	})

	resetFlow(session)

	return {
		type: EffectType.EDIT,
		page: WithdrawSuccessPage.render({
			transaction: withdrawResult,
			currencyAmount,
			blockchainFee: withdrawResult.cost,
			recipientAddress,
		}),
	}
})
