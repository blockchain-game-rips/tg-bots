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
import { EffectType, HandlerResult, PageContent } from '../../types'
import { balanceCache } from '../../cache/balance-cache'
import { AmountPayload, amountCodec } from '../../utils/codecs'
import { currencyChainAddressCodec } from '../../utils/currency'
import { isFlow } from '@rips/grammy-kit'
import { userApiKey } from '../../utils/api/key'

/** Only what the user chose — every balance is read fresh at render time. */
export interface WithdrawDraft {
	chainAddress: ChainAddressDtoOutput
	amount?: bigint
	recipientAddress?: string
}

export const openWithdrawFromCurrency: ActionDef<ChainAddressDtoOutput> =
	withPayload(currencyChainAddressCodec, (session, chainAddress) => {
		//keep recipient and amount, switch the currency
		if (isFlow(session, 'withdraw', 'withdraw-page')) {
			const draft = session.flow.data

			return renderWithdraw(session.telegramId, {
				...draft,
				chainAddress,
			})
		}

		return renderWithdraw(session.telegramId, { chainAddress })
	})

export const openWithdrawFromAmount: ActionDef<AmountPayload> = withPayload(
	amountCodec,
	async (session, amountPayload) => {
		assertFlow(session, 'withdraw', 'withdraw-page')

		const draft = session.flow.data

		const currencyBalance = await balanceCache.getOne(
			session.telegramId,
			draft.chainAddress,
		)

		const amount = await resolveAmount(
			session.telegramId,
			amountPayload,
			currencyBalance,
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
	telegramId: number,
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
	telegramId: number,
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

/**
 * Reads balances through the cache on every render, so a replay of this handler
 * from the back trail cannot show what the balances were when it first ran.
 */
async function renderWithdraw(
	telegramId: number,
	draft: WithdrawDraft,
): Promise<HandlerResult<Flow>> {
	return {
		flow: toFlow('withdraw', 'withdraw-page', draft),
		effect: {
			type: EffectType.NAVIGATE,
			page: await renderWithdrawPage(telegramId, draft),
		},
	}
}

export async function renderWithdrawPage(
	telegramId: number,
	draft: WithdrawDraft,
): Promise<PageContent> {
	const { chainAddress, amount, recipientAddress } = draft

	const [currencyBalance, nativeBalance] = await balanceCache.getPair(
		telegramId,
		chainAddress,
		nativeChainAddress(chainAddress.chain),
	)

	if (amount === undefined || recipientAddress === undefined) {
		return WithdrawPage.render({
			kind: 'pending',
			currencyBalance,
			amount,
			recipientAddress,
		})
	}

	const withdrawQuote = await quoteWithdraw(
		telegramId,
		{ currency: currencyBalance.currency, amount: amount.toString() },
		recipientAddress,
	)

	return WithdrawPage.render({
		kind: 'quoted',
		currencyBalance,
		nativeBalance,
		amount,
		recipientAddress,
		withdrawQuote,
	})
}

async function quoteWithdraw(
	telegramId: number,
	amountIn: CurrencyAmountDtoOutput,
	recipientAddress: string,
) {
	const { data } = await walletsControllerQuoteWithdraw({
		headers: {
			'x-telegram-id': telegramId.toString(),
			'x-user-key': userApiKey(),
		},
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
