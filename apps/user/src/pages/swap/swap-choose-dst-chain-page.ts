import { CurrencyAmountDtoOutput } from '@rips/api-client'
import { FormattedString, joinLines, Line } from '@rips/grammy-kit'
import {
	Chain,
	currencyAmountDisplayParts,
	toCurrencyAmount,
} from '@rips/shared'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { currencyToChainName } from '../../utils/chain'
import { swapBreadcrumb } from '../../utils/display/breadcrumb'
import { buildChainKeyboard } from '../../utils/chain-currency-keyboard'

export const SwapChooseDstChainPage = {
	renderFreshDraft(args: {
		srcBalance: CurrencyAmountDtoOutput
		dstChains: Chain[]
	}): PageContent {
		const { srcBalance, dstChains } = args

		return {
			message: buildMessage(srcBalance),
			keyboard: buildChainKeyboard(
				dstChains,
				actionIds.openSwapChooseDstToken,
			).appendNavButtons(),
		}
	},

	renderDraftEdit(args: {
		srcBalance: CurrencyAmountDtoOutput
		dstChains: Chain[]
		amountIn: bigint
	}): PageContent {
		const { srcBalance, dstChains, amountIn } = args

		return {
			message: buildMessage(srcBalance, amountIn),
			keyboard: buildChainKeyboard(
				dstChains,
				actionIds.openSwapChooseDstToken,
			).appendNavButtons(),
		}
	},
}

function buildMessage(
	srcBalance: CurrencyAmountDtoOutput,
	amountIn?: bigint,
): FormattedString {
	const srcCurrency = srcBalance.currency
	const srcChainName = currencyToChainName(srcCurrency)

	const amount =
		amountIn === undefined
			? undefined
			: toCurrencyAmount(amountIn, srcCurrency)
	const { displayAmount: balanceAmount, symbol: balanceSymbol } =
		currencyAmountDisplayParts(srcBalance)

	const lines: Line[] = [
		swapBreadcrumb(),
		'',
		`From: ${srcChainName} ${srcCurrency.symbol}`,
		...amountLines(amount),
		'',
		`Your ${srcChainName} balance:`,
		`${balanceAmount} ${balanceSymbol}`,
		'',
		'Choose destination chain:',
	]

	return joinLines(lines)
}

function amountLines(amount?: CurrencyAmountDtoOutput): string[] {
	if (amount === undefined) return []

	const { displayAmount, symbol } = currencyAmountDisplayParts(amount)

	return [`Amount: ${displayAmount} ${symbol}`]
}
