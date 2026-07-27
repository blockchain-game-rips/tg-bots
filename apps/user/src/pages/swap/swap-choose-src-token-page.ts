import { CurrencyDto } from '@rips/api-client'
import { addNav, FormattedString, joinLines, Line } from '@rips/grammy-kit'
import { currencyAmountDisplayParts, toCurrencyAmount } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { Chain, PageContent } from '../../types'
import { chainToName } from '../../utils/chain'
import { swapBreadcrumb } from '../../utils/display/breadcrumb'
import { buildCurrencyKeyboard } from '../choose-chain-currency'

export const SwapChooseSrcTokenPage = {
	renderFreshDraft(args: {
		srcChain: Chain
		currencies: CurrencyDto[]
	}): PageContent {
		const { srcChain, currencies } = args

		return {
			message: buildMessage([`From: ${chainToName(srcChain)}`]),
			keyboard: buildFreshDraftKeyboard(currencies),
		}
	},

	renderDraftEdit(args: {
		srcChain: Chain
		currencies: CurrencyDto[]
		srcCurrency: CurrencyDto
		dstCurrency: CurrencyDto
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
	srcCurrency: CurrencyDto,
	dstCurrency: CurrencyDto,
	amountIn: bigint,
): string[] {
	const amount = toCurrencyAmount(amountIn, srcCurrency)
	const { displayAmount } = currencyAmountDisplayParts(amount)
	const dstChainName = chainToName(dstCurrency.chainAddress.chain)

	return [
		`From: ${chainToName(srcChain)}`,
		`To: ${dstChainName} ${dstCurrency.symbol}`,
		`Amount: ${displayAmount}`,
	]
}

function buildFreshDraftKeyboard(currencies: CurrencyDto[]): InlineKeyboard {
	const keyboard = buildCurrencyKeyboard(
		currencies,
		actionIds.openSwapChooseDstChain,
	)

	return addNav(keyboard, {
		parent: actionIds.openSwapChooseSrcChain,
		home: actionIds.openHome,
	})
}

function buildDraftEditKeyboard(currencies: CurrencyDto[]): InlineKeyboard {
	const keyboard = buildCurrencyKeyboard(
		currencies,
		actionIds.openSwapCheckoutFromSrc,
	)

	return addNav(keyboard, {
		parent: actionIds.openSwapCheckout,
		home: actionIds.openHome,
	})
}
