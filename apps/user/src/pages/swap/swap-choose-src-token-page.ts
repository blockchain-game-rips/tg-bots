import { CurrencyDto } from '@rips/api-client'
import { addNav } from '@rips/grammy-kit'
import { currencyAmountDisplayParts, toCurrencyAmount } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { Chain, PageContent } from '../../types'
import { chainToName } from '../../utils/chain'
import { swapBreadcrumb } from '../../utils/display/breadcrumb'
import { buildTokenKeyboard } from '../choose-chain-token'

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

function buildMessage(contextLines: string[]): string {
	return [swapBreadcrumb(), '', ...contextLines, '', 'Choose token:'].join(
		'\n',
	)
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
	const keyboard = buildTokenKeyboard(
		currencies,
		actionIds.openSwapChooseDstChain,
	)

	return addNav(keyboard, {
		parent: actionIds.openSwapChooseSrcChain,
		home: actionIds.openHome,
	})
}

function buildDraftEditKeyboard(currencies: CurrencyDto[]): InlineKeyboard {
	const keyboard = buildTokenKeyboard(
		currencies,
		actionIds.openSwapCheckoutFromSrc,
	)

	return addNav(keyboard, {
		parent: actionIds.openSwapCheckout,
		home: actionIds.openHome,
	})
}
