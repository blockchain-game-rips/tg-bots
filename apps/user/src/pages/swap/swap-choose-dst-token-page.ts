import { Chain } from '@rips/shared'
import { CurrencyAmountDtoOutput, CurrencyDtoOutput } from '@rips/api-client'
import { FormattedString, joinLines, Line } from '@rips/grammy-kit'
import { currencyAmountDisplayParts, toCurrencyAmount } from '@rips/shared'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { chainToName, currencyToChainName } from '../../utils/chain'
import { swapBreadcrumb } from '../../utils/display/breadcrumb'
import { buildCurrencyKeyboard } from '../../utils/chain-currency-keyboard'

interface Draft {
	srcBalance: CurrencyAmountDtoOutput
	dstChain: Chain
	dstCurrencies: CurrencyDtoOutput[]
}

export const SwapChooseDstTokenPage = {
	renderFreshDraft(draft: Draft): PageContent {
		return {
			message: buildMessage(draft),
			keyboard: buildCurrencyKeyboard(
				draft.dstCurrencies,
				actionIds.openSwapChooseAmount,
			).appendNavButtons(),
		}
	},

	renderDraftEdit(draft: Draft, amountIn: bigint): PageContent {
		return {
			message: buildMessage(draft, amountIn),
			keyboard: buildCurrencyKeyboard(
				draft.dstCurrencies,
				actionIds.openSwapCheckoutFromDst,
			).appendNavButtons(),
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
