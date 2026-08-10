import { Chain } from '@rips/shared'
import { CurrencyDtoOutput } from '@rips/api-client'
import { FormattedString, joinLines, Line } from '@rips/grammy-kit'
import { currencyAmountDisplayParts, toCurrencyAmount } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { chainToName, currencyToChainName } from '../../utils/chain'
import { swapBreadcrumb } from '../../utils/display/breadcrumb'
import { buildCurrencyKeyboard } from '../choose-chain-currency'

export const SwapChooseSrcTokenPage = {
	renderFreshDraft(args: {
		srcChain: Chain
		currencies: CurrencyDtoOutput[]
	}): PageContent {
		const { srcChain, currencies } = args

		return {
			message: buildMessage([`From: ${chainToName(srcChain)}`]),
			keyboard: buildFreshDraftKeyboard(currencies),
		}
	},

	renderDraftEdit(args: {
		srcChain: Chain
		currencies: CurrencyDtoOutput[]
		srcCurrency: CurrencyDtoOutput
		dstCurrency: CurrencyDtoOutput
		amountIn: bigint
	}): PageContent {
		const { srcChain, currencies, srcCurrency, dstCurrency, amountIn } =
			args

		return {
			message: buildMessage(
				draftLines(srcChain, srcCurrency, dstCurrency, amountIn),
			),
			keyboard: buildDraftEditKeyboard(currencies),
		}
	},
}

function buildMessage(contextLines: string[]): FormattedString {
	const lines: Line[] = [
		swapBreadcrumb(),
		'',
		...contextLines,
		'',
		'Choose token:',
	]

	return joinLines(lines)
}

function draftLines(
	srcChain: Chain,
	srcCurrency: CurrencyDtoOutput,
	dstCurrency: CurrencyDtoOutput,
	amountIn: bigint,
): string[] {
	const amount = toCurrencyAmount(amountIn, srcCurrency)
	const { displayAmount } = currencyAmountDisplayParts(amount)
	const dstChainName = currencyToChainName(dstCurrency)

	return [
		`From: ${chainToName(srcChain)}`,
		`To: ${dstChainName} ${dstCurrency.symbol}`,
		`Amount: ${displayAmount}`,
	]
}

function buildFreshDraftKeyboard(
	currencies: CurrencyDtoOutput[],
): InlineKeyboard {
	const keyboard = buildCurrencyKeyboard(
		currencies,
		actionIds.openSwapChooseDstChain,
	)

	return keyboard.appendNavButtons({
		parent: actionIds.openSwapChooseSrcChain,
		home: actionIds.openHome,
	})
}

function buildDraftEditKeyboard(
	currencies: CurrencyDtoOutput[],
): InlineKeyboard {
	const keyboard = buildCurrencyKeyboard(
		currencies,
		actionIds.openSwapCheckoutFromSrc,
	)

	return keyboard.appendNavButtons({
		parent: actionIds.openSwapCheckout,
		home: actionIds.openHome,
	})
}
