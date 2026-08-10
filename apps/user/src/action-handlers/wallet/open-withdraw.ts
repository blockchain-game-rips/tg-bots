import {
	ChainAddressDtoOutput,
	CurrencyAmountDtoOutput,
	walletsControllerQuoteWithdraw,
} from '@rips/api-client'
import { assertFlow } from '@rips/grammy-kit'
import {
	parseCurrencyAmount,
	parseEvmAddress,
	usdToTokenUnits,
} from '@rips/shared'
import { ActionDef, withPayload } from '../../action-def'
import {
	isNativeChainAddress,
	NATIVE_MAX_MARGIN_USD,
	nativeChainAddress,
	ZERO_ADDRESS,
} from '../../constants'
import { Flow, toFlow } from '../../flows'
import { WithdrawPage } from '../../pages/wallet/withdraw-page'
import { EffectType, HandlerResult } from '../../types'
import { fetchBalances, getBalance } from '../../utils/api/wrappers'
import { AmountPayload, amountCodec } from '../../utils/codecs'
import { currencyChainAddressCodec } from '../../utils/currency'
import { isFlow } from '@rips/grammy-kit'

interface WithdrawDraft {
	currencyBalance: CurrencyAmountDtoOutput
	nativeBalance: CurrencyAmountDtoOutput
	amount?: bigint
	recipientAddress?: string
}

export const openWithdrawFromCurrency: ActionDef<ChainAddressDtoOutput> =
	withPayload(currencyChainAddressCodec, async (session, chainAddress) => {
		const balances = await fetchCurrencyAndNativeBalances(
			session.telegramId,
			chainAddress,
		)

		//keep recipient and amount, update balances
		if (isFlow(session, 'withdraw', 'withdraw-page')) {
			const draft = session.flow.data
			return renderWithdraw(session.telegramId, { ...draft, ...balances })
		}

		return renderWithdraw(session.telegramId, { ...balances })
	})

export const openWithdrawFromAmount: ActionDef<AmountPayload> = withPayload(
	amountCodec,
	async (session, amountPayload) => {
		assertFlow(session, 'withdraw', 'withdraw-page')

		const draft = session.flow.data

		const amount = await resolveAmount(
			session.telegramId,
			amountPayload,
			draft.currencyBalance,
			draft.recipientAddress,
		)

		return renderWithdraw(session.telegramId, { ...draft, amount })
	},
)

export const openWithdrawFromRecipient: ActionDef<string> = withPayload(
	{
		encode: (address) => address,
		decode: (raw) => parseEvmAddress(raw),
	},
	async (session, recipientAddress) => {
		assertFlow(session, 'withdraw', 'withdraw-page')

		const draft = session.flow.data

		return renderWithdraw(session.telegramId, {
			...draft,
			recipientAddress,
		})
	},
)

async function resolveAmount(
	telegramId: string,
	amountPayload: AmountPayload,
	currencyBalance: CurrencyAmountDtoOutput,
	recipientAddress: string | undefined,
): Promise<bigint> {
	const { currency } = currencyBalance

	if (amountPayload.kind === 'exact') {
		return BigInt(
			parseCurrencyAmount(String(amountPayload.value), currency).amount,
		)
	}

	if (!isNativeChainAddress(currency.chainAddress)) {
		return BigInt(currencyBalance.amount)
	}

	return resolveNativeMaxAmount(telegramId, currencyBalance, recipientAddress)
}

async function resolveNativeMaxAmount(
	telegramId: string,
	currencyBalance: CurrencyAmountDtoOutput,
	recipientAddress: string | undefined,
): Promise<bigint> {
	const balance = BigInt(currencyBalance.amount)

	const probeQuote = await quoteWithdraw(
		telegramId,
		currencyBalance,
		recipientAddress ?? ZERO_ADDRESS,
	)

	const margin = usdToTokenUnits(
		NATIVE_MAX_MARGIN_USD,
		currencyBalance.currency,
	)

	const reserved = BigInt(probeQuote.blockchainFee.amount) + margin

	return balance > reserved ? balance - reserved : 0n
}

async function renderWithdraw(
	telegramId: string,
	draft: WithdrawDraft,
): Promise<HandlerResult<Flow>> {
	const flow = toFlow('withdraw', 'withdraw-page', draft)

	const { currencyBalance, nativeBalance, amount, recipientAddress } = draft

	if (amount === undefined || recipientAddress === undefined) {
		return {
			flow,
			effect: {
				type: EffectType.EDIT,
				page: WithdrawPage.render({
					kind: 'pending',
					currencyBalance,
					amount,
					recipientAddress,
				}),
			},
		}
	}

	const withdrawQuote = await quoteWithdraw(
		telegramId,
		{ currency: currencyBalance.currency, amount: amount.toString() },
		recipientAddress,
	)

	return {
		flow,
		effect: {
			type: EffectType.EDIT,
			page: WithdrawPage.render({
				kind: 'quoted',
				currencyBalance,
				nativeBalance,
				amount,
				recipientAddress,
				withdrawQuote,
			}),
		},
	}
}

async function quoteWithdraw(
	telegramId: string,
	amountIn: CurrencyAmountDtoOutput,
	recipientAddress: string,
) {
	const { data } = await walletsControllerQuoteWithdraw({
		headers: { 'x-telegram-id': telegramId },
		body: {
			amountIn: {
				currencyChainAddress: amountIn.currency.chainAddress,
				amount: amountIn.amount,
			},
			currencyOutChainAddress: amountIn.currency.chainAddress,
			recipientAddress,
		},
	})

	return data
}

async function fetchCurrencyAndNativeBalances(
	telegramId: string,
	chainAddress: ChainAddressDtoOutput,
): Promise<WithdrawDraft> {
	const nativeChainAddressDto = nativeChainAddress(chainAddress.chain)

	const balances = await fetchBalances(telegramId, [
		chainAddress,
		nativeChainAddressDto,
	])

	return {
		currencyBalance: getBalance(balances, chainAddress),
		nativeBalance: getBalance(balances, nativeChainAddressDto),
	}
}
