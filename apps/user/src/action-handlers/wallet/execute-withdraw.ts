import { walletsControllerCreateWithdrawal } from '@rips/api-client'
import { assertFlow } from '@rips/grammy-kit'
import { toCurrencyAmount } from '@rips/shared'
import { ActionDef, noPayload } from '../../action-def'
import { balanceCache } from '../../cache/balance-cache'
import { currencyCache } from '../../cache/currency-cache'
import { withNative } from '../../constants'
import { toReset } from '../../flows'
import { WithdrawSuccessPage } from '../../pages/wallet/withdraw-success-page'
import { EffectType } from '../../types'
import { callOrUnknown } from '../../utils/api/call-or-unknown'
import { errorOnFreshPage } from '../../utils/display/error-on-fresh-page'
import {
	unknownMessage,
	withdrawNouns,
} from '../../utils/display/transaction-outcome-copy'
import { failureMessage } from '../../utils/display/transaction-status'
import { renderWithdrawPage, WithdrawDraft } from './open-withdraw'

export const executeWithdraw: ActionDef<void> = noPayload(async (session) => {
	assertFlow(session, 'withdraw', 'withdraw-page')

	const draft = session.flow.data
	const { chainAddress, amount, recipientAddress } = draft

	if (amount === undefined || recipientAddress === undefined) {
		throw new Error(
			'Amount and recipient are required to confirm withdrawal',
		)
	}

	const currency = await currencyCache.getOne(chainAddress)

	const currencyAmount = toCurrencyAmount(amount, currency)

	const response = await callOrUnknown(() =>
		walletsControllerCreateWithdrawal({
			headers: { 'x-telegram-id': session.telegramId },
			body: {
				amountIn: {
					amount: amount.toString(),
					currencyChainAddress: currency.chainAddress,
				},
				currencyOutChainAddress: currency.chainAddress,
				recipientAddress,
			},
		}),
	)

	await balanceCache.invalidate(
		session.telegramId,
		withNative(currency.chainAddress),
	)

	if (response === null) {
		throw await toWithdrawError(
			session.telegramId,
			draft,
			unknownMessage(withdrawNouns),
		)
	}

	const { withdrawal } = response.data

	if (withdrawal.status !== 'succeeded') {
		throw await toWithdrawError(
			session.telegramId,
			draft,
			failureMessage(withdrawal, withdrawNouns),
		)
	}

	return {
		flow: toReset(),
		effect: {
			type: EffectType.NAVIGATE,
			page: WithdrawSuccessPage.render({
				transaction: withdrawal.transaction,
				currencyAmount,
				recipientAddress,
			}),
			history: { kind: 'page' },
		},
	}
})

function toWithdrawError(
	telegramId: string,
	draft: WithdrawDraft,
	message: string,
) {
	return errorOnFreshPage(
		() => renderWithdrawPage(telegramId, draft),
		message,
	)
}
