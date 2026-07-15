import { CurrencyAmountDto } from '@rips/api-client'
import { addNav, NavIds } from '@rips/grammy-kit'
import {
	currencyAmountDisplayParts,
	swapBreadcrumb,
	toCurrencyAmount,
} from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { Chain, PageContent } from '../../types'
import { chainToName } from '../../utils/chain'
import { buildChainKeyboard } from '../choose-chain-token'

export const SwapChooseDstChainPage = {
	renderFreshDraft(args: {
		srcBalance: CurrencyAmountDto
		dstChains: Chain[]
	}): PageContent {
		const { srcBalance, dstChains } = args

		const backToSrcToken: NavIds = {
			parent: actionIds.openSwapChooseSrcToken,
			parentPayload: srcBalance.currency.chainAddress.chain,
			home: actionIds.openHome,
		}

		return {
			message: buildMessage(srcBalance),
			keyboard: buildKeyboard(dstChains, backToSrcToken),
		}
	},

	renderDraftEdit(args: {
		srcBalance: CurrencyAmountDto
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
	srcBalance: CurrencyAmountDto,
	amountIn?: bigint,
): string {
	const srcCurrency = srcBalance.currency
	const srcChainName = chainToName(srcCurrency.chainAddress.chain)

	const amount =
		amountIn === undefined
			? undefined
			: toCurrencyAmount(amountIn, srcCurrency)
	const { displayAmount: balanceAmount, symbol: balanceSymbol } =
		currencyAmountDisplayParts(srcBalance)

	return [
		swapBreadcrumb(),
		'',
		`From: ${srcChainName} ${srcCurrency.symbol}`,
		...amountLines(amount),
		'',
		`Your ${srcChainName} balance:`,
		`${balanceAmount} ${balanceSymbol}`,
		'',
		'Choose destination chain:',
	].join('\n')
}

function amountLines(amount?: CurrencyAmountDto): string[] {
	if (amount === undefined) return []

	const { displayAmount, symbol } = currencyAmountDisplayParts(amount)

	return [`Amount: ${displayAmount} ${symbol}`]
}

function buildKeyboard(dstChains: Chain[], nav: NavIds): InlineKeyboard {
	const keyboard = buildChainKeyboard(
		dstChains,
		actionIds.openSwapChooseDstToken,
	)

	return addNav(keyboard, nav)
}
