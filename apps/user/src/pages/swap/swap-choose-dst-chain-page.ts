import { CurrencyAmountDtoOutput } from '@rips/api-client'
import { FormattedString, joinLines, Line, NavIds } from '@rips/grammy-kit'
import {
	Chain,
	currencyAmountDisplayParts,
	currencyToChain,
	toCurrencyAmount,
} from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { currencyToChainName } from '../../utils/chain'
import { swapBreadcrumb } from '../../utils/display/breadcrumb'
import { buildChainKeyboard } from '../choose-chain-currency'

export const SwapChooseDstChainPage = {
	renderFreshDraft(args: {
		srcBalance: CurrencyAmountDtoOutput
		dstChains: Chain[]
	}): PageContent {
		const { srcBalance, dstChains } = args

		const backToSrcToken: NavIds = {
			parent: actionIds.openSwapChooseSrcToken,
			parentPayload: currencyToChain(srcBalance.currency),
			home: actionIds.openHome,
		}

		return {
			message: buildMessage(srcBalance),
			keyboard: buildKeyboard(dstChains, backToSrcToken),
		}
	},

	renderDraftEdit(args: {
		srcBalance: CurrencyAmountDtoOutput
		dstChains: Chain[]
		amountIn: bigint
	}): PageContent {
		const { srcBalance, dstChains, amountIn } = args

		const backToCheckout: NavIds = {
			parent: actionIds.openSwapCheckout,
			home: actionIds.openHome,
		}

		return {
			message: buildMessage(srcBalance, amountIn),
			keyboard: buildKeyboard(dstChains, backToCheckout),
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

function buildKeyboard(dstChains: Chain[], nav: NavIds): InlineKeyboard {
	const keyboard = buildChainKeyboard(
		dstChains,
		actionIds.openSwapChooseDstToken,
	)

	return keyboard.appendNavButtons(nav)
}
