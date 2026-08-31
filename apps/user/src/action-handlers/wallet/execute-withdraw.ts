import { walletsControllerCreateWithdrawal } from '@rips/api-client'
import { assertFlow } from '@rips/grammy-kit'
import { toCurrencyAmount } from '@rips/shared'
import { ActionDef, noPayload } from '../../action-def'
import { balanceCache } from '../../cache/balance-cache'
import { currencyCache } from '../../cache/currency-cache'
import { withNative } from '../../constants'
import { WITHDRAW_FRAME } from '../../domain/loading-frames'
import { Flow, toReset } from '../../flows'
import { WithdrawSuccessPage } from '../../pages/wallet/withdraw-success-page'
import { EffectType, HandlerResult } from '../../types'
import { callOrUnknown } from '../../utils/api/call-or-unknown'
import { errorOnFreshPage } from '../../utils/display/error-on-fresh-page'
import {
	unknownMessage,
	withdrawNouns,
} from '../../utils/display/transaction-outcome-copy'
import { failureMessage } from '../../utils/display/transaction-status'
import { renderWithdrawPage, WithdrawDraft } from './open-withdraw'
import { userApiKey } from '../../utils/api/key'

export const executeWithdraw: ActionDef<void> = noPayload((session) => {
	assertFlow(session, 'withdraw', 'withdraw-page')

	const draft = session.flow.data
	const { amount, recipientAddress } = draft

	if (amount === undefined || recipientAddress === undefined) {
		throw new Error(
			'Amount and recipient are required to confirm withdrawal',
		)
	}

	return {
		effect: {
			type: EffectType.LOADING,
			message: WITHDRAW_FRAME,
			next: () =>
				executeWithdrawRequest(session.telegramId, draft, {
					amount,
					recipientAddress,
				}),
		},
	}
})

interface ConfirmedWithdrawal {
	amount: bigint
	recipientAddress: string
}

async function executeWithdrawRequest(
	telegramId: number,
	draft: WithdrawDraft,
	{ amount, recipientAddress }: ConfirmedWithdrawal,
): Promise<HandlerResult<Flow>> {
	const currency = await currencyCache.getOne(draft.chainAddress)

	const currencyAmount = toCurrencyAmount(amount, currency)

	const response = await callOrUnknown(() =>
		walletsControllerCreateWithdrawal({
			headers: {
				'x-telegram-id': telegramId.toString(),
				'x-user-key': userApiKey(),
			},
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

	await balanceCache.invalidate(telegramId, withNative(currency.chainAddress))

	if (response === null) {
		throw await toWithdrawError(
			telegramId,
			draft,
			unknownMessage(withdrawNouns),
		)
	}

	const { withdrawal } = response.data

	if (withdrawal.status !== 'succeeded') {
		throw await toWithdrawError(
			telegramId,
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
}

function toWithdrawError(
	telegramId: number,
	draft: WithdrawDraft,
	message: string,
) {
	return errorOnFreshPage(
		() => renderWithdrawPage(telegramId, draft),
		message,
	)
}
