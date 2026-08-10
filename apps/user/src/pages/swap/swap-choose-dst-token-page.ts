import { Chain } from '@rips/shared'
import { CurrencyAmountDtoOutput, CurrencyDtoOutput } from '@rips/api-client'
import { FormattedString, joinLines, Line } from '@rips/grammy-kit'
import { currencyAmountDisplayParts, toCurrencyAmount } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { chainToName, currencyToChainName } from '../../utils/chain'
import { swapBreadcrumb } from '../../utils/display/breadcrumb'
import { buildCurrencyKeyboard } from '../choose-chain-currency'

interface Draft {
	srcBalance: CurrencyAmountDtoOutput
	dstChain: Chain
	dstCurrencies: CurrencyDtoOutput[]
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

function buildMessage(draft: Draft, amountIn?: bigint): FormattedString {
	const { srcBalance, dstChain } = draft

	const srcCurrency = srcBalance.currency
	const amount =
		amountIn === undefined
			? undefined
			: toCurrencyAmount(amountIn, srcCurrency)
	const srcChainName = currencyToChainName(srcCurrency)

	const lines: Line[] = [
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
	]

	return joinLines(lines)
}

function amountLine(amount?: CurrencyAmountDtoOutput): string[] {
	if (amount === undefined) return []

	return [`Amount: ${formatAmount(amount)}`]
}

function formatAmount(amount: CurrencyAmountDtoOutput): string {
	const { displayAmount, symbol } = currencyAmountDisplayParts(amount)

	return `${displayAmount} ${symbol}`
}

function buildFreshDraftKeyboard(draft: Draft): InlineKeyboard {
	const keyboard = buildCurrencyKeyboard(
		draft.dstCurrencies,
		actionIds.openSwapChooseAmount,
	)

	return keyboard.appendNavButtons({
		parent: actionIds.openSwapChooseDstChain,
		parentPayload: draft.srcBalance.currency.chainAddress,
		home: actionIds.openHome,
	})
}

function buildDraftEditKeyboard(
	dstCurrencies: CurrencyDtoOutput[],
): InlineKeyboard {
	const keyboard = buildCurrencyKeyboard(
		dstCurrencies,
		actionIds.openSwapCheckoutFromDst,
	)

	return keyboard.appendNavButtons({
		parent: actionIds.openSwapCheckout,
		home: actionIds.openHome,
	})
}
