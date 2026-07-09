import { CurrencyAmountDto, CurrencyDto } from '@rips/api-client'
import { addNav, NavIds } from '@rips/grammy-kit'
import { currencyAmountDisplayParts, swapBreadcrumb } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { Chain, PageContent } from '../../types'
import { chainToName } from '../../utils/chain'
import { buildTokenKeyboard } from '../choose-chain-token'

interface Draft {
	srcCurrency: CurrencyDto
	srcBalance: CurrencyAmountDto
	dstChain: Chain
	dstCurrencies: CurrencyDto[]
}

export const SwapChooseDstTokenPage = {
	renderFreshDraft(draft: Draft): PageContent {
		const backToDstChain: NavIds = {
			parent: actionIds.openSwapChooseDstChain,
			parentPayload: draft.srcCurrency.chainAddress,
			home: actionIds.openHome,
		}

		return {
			message: buildMessage(draft),
			keyboard: buildKeyboard(draft.dstCurrencies, backToDstChain),
		}
	},

	renderDraftEdit(draft: Draft, amount: CurrencyAmountDto): PageContent {
		const backToCheckout: NavIds = {
			parent: actionIds.openSwapCheckout,
			home: actionIds.openHome,
		}

		return {
			message: buildMessage(draft, amount),
			keyboard: buildKeyboard(draft.dstCurrencies, backToCheckout),
		}
	},
}

function buildMessage(draft: Draft, amount?: CurrencyAmountDto): string {
	const { srcCurrency, srcBalance, dstChain } = draft

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

function buildKeyboard(
	dstCurrencies: CurrencyDto[],
	back: NavIds,
): InlineKeyboard {
	const keyboard = buildTokenKeyboard(
		dstCurrencies,
		actionIds.openSwapChooseAmount,
	)

	return addNav(keyboard, back)
}
