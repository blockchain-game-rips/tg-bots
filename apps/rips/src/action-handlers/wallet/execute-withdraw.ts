import { walletsControllerCreateWithdrawal } from '../../../generated/api-client'
import { WithdrawSuccessPage } from '../../pages/wallet/withdraw-success-page'
import { Effect, EffectType, SessionData } from '../../types'
import { toCurrencyAmount } from '../../utils/currency'
import { assertFlow, resetFlow } from '../../utils/session-utils'

export async function executeWithdraw(
	session: SessionData,
	_payload: string | undefined,
): Promise<Effect> {
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
}
