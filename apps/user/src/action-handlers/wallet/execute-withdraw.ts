import { walletsControllerCreateWithdrawal } from '@rips/api-client'
import { assertFlow } from '@rips/grammy-kit'
import { ActionDef, noPayload } from '../../action-def'
import { balanceCache } from '../../cache/balance-cache'
import { toReset } from '../../flows'
import { WithdrawSuccessPage } from '../../pages/wallet/withdraw-success-page'
import { EffectType } from '../../types'
import { toCurrencyAmount } from '@rips/shared'

export const executeWithdraw: ActionDef<void> = noPayload(async (session) => {
	assertFlow(session, 'withdraw', 'withdraw-page')

	const { currencyBalance, amount, recipientAddress } = session.flow.data

	const { currency } = currencyBalance

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

	await balanceCache.invalidateSpent(session.telegramId, [
		currency.chainAddress,
	])

	return {
		flow: toReset(),
		effect: {
			type: EffectType.NAVIGATE,
			page: WithdrawSuccessPage.render({
				transaction: withdrawResult,
				currencyAmount,
				recipientAddress,
			}),
		},
	}
})
