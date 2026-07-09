import { CurrencyAmountDto, CurrencyDto } from '@rips/api-client'
import { addNav, NavIds } from '@rips/grammy-kit'
import { currencyAmountDisplayParts, swapBreadcrumb } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { Chain, PageContent } from '../../types'
import { chainToName } from '../../utils/chain'
import { buildChainKeyboard } from '../choose-chain-token'

export const SwapChooseDstChainPage = {
	renderFreshDraft(args: {
		srcCurrency: CurrencyDto
		srcBalance: CurrencyAmountDto
		dstChains: Chain[]
	}): PageContent {
		const { srcCurrency, srcBalance, dstChains } = args

		const backToSrcToken: NavIds = {
			parent: actionIds.openSwapChooseSrcToken,
			parentPayload: srcCurrency.chainAddress.chain,
			home: actionIds.openHome,
		}

		return {
			message: buildMessage(srcCurrency, srcBalance),
			keyboard: buildKeyboard(dstChains, backToSrcToken),
		}
	},

	renderDraftEdit(args: {
		srcCurrency: CurrencyDto
		srcBalance: CurrencyAmountDto
		dstChains: Chain[]
		amount: CurrencyAmountDto
	}): PageContent {
		const { srcCurrency, srcBalance, dstChains, amount } = args

		const backToCheckout: NavIds = {
			parent: actionIds.openSwapCheckout,
			home: actionIds.openHome,
		}

		return {
			message: buildMessage(srcCurrency, srcBalance, amount),
			keyboard: buildKeyboard(dstChains, backToCheckout),
		}
	},
}

function buildMessage(
	srcCurrency: CurrencyDto,
	srcBalance: CurrencyAmountDto,
	amount?: CurrencyAmountDto,
): string {
	const srcChainName = chainToName(srcCurrency.chainAddress.chain)
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
