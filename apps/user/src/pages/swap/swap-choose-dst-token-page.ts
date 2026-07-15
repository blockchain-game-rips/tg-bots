import { CurrencyAmountDto, CurrencyDto } from '@rips/api-client'
import { addNav } from '@rips/grammy-kit'
import { currencyAmountDisplayParts, toCurrencyAmount } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { Chain, PageContent } from '../../types'
import { chainToName } from '../../utils/chain'
import { swapBreadcrumb } from '../../utils/display/breadcrumb'
import { buildTokenKeyboard } from '../choose-chain-token'

interface Draft {
	srcBalance: CurrencyAmountDto
	dstChain: Chain
	dstCurrencies: CurrencyDto[]
}

export const SwapChooseDstTokenPage = {
	renderFreshDraft(draft: Draft): PageContent {
		return {
			message: buildMessage(draft),
			keyboard: buildFreshDraftKeyboard(draft),
		}
	},

	renderDraftEdit(draft: Draft, amountIn: bigint): PageContent {
		return {
			message: buildMessage(draft, amountIn),
			keyboard: buildDraftEditKeyboard(draft.dstCurrencies),
		}
	},
}

function buildMessage(draft: Draft, amountIn?: bigint): string {
	const { srcBalance, dstChain } = draft

	const srcCurrency = srcBalance.currency
	const amount =
		amountIn === undefined
			? undefined
			: toCurrencyAmount(amountIn, srcCurrency)
	const srcChainName = chainToName(srcCurrency.chainAddress.chain)

	return [
		swapBreadcrumb(),
		'',
		`From: ${srcChainName} ${srcCurrency.symbol}`,
		`To: ${chainToName(dstChain)}`,
		...amountLine(amount),
		'',
		`Your ${srcChainName} balance:`,
		formatAmount(srcBalance),
		'',
		'Choose token:',
	].join('\n')
}

function amountLine(amount?: CurrencyAmountDto): string[] {
	if (amount === undefined) return []

	return [`Amount: ${formatAmount(amount)}`]
}

function formatAmount(amount: CurrencyAmountDto): string {
	const { displayAmount, symbol } = currencyAmountDisplayParts(amount)

	return `${displayAmount} ${symbol}`
}

function buildFreshDraftKeyboard(draft: Draft): InlineKeyboard {
	const keyboard = buildTokenKeyboard(
		draft.dstCurrencies,
		actionIds.openSwapChooseAmount,
	)

	return addNav(keyboard, {
		parent: actionIds.openSwapChooseDstChain,
		parentPayload: draft.srcBalance.currency.chainAddress,
		home: actionIds.openHome,
	})
}

function buildDraftEditKeyboard(dstCurrencies: CurrencyDto[]): InlineKeyboard {
	const keyboard = buildTokenKeyboard(
		dstCurrencies,
		actionIds.openSwapCheckoutFromDst,
	)

	return addNav(keyboard, {
		parent: actionIds.openSwapCheckout,
		home: actionIds.openHome,
	})
}
