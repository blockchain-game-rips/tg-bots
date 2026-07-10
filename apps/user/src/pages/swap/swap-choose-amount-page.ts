import { CurrencyAmountDto, CurrencyDto } from '@rips/api-client'
import { addNav, buildActionData, NavIds } from '@rips/grammy-kit'
import {
	currencyAmountDisplayParts,
	formatUnits,
	swapBreadcrumb,
} from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { chainToName } from '../../utils/chain'

interface Draft {
	srcCurrency: CurrencyDto
	srcBalance: CurrencyAmountDto
	dstCurrency: CurrencyDto
}

export const SwapChooseAmountPage = {
	renderFreshDraft(draft: Draft): PageContent {
		return render(draft, {
			parent: actionIds.openSwapChooseDstToken,
			parentPayload: draft.dstCurrency.chainAddress.chain,
			home: actionIds.openHome,
		})
	},

	renderDraftEdit(draft: Draft): PageContent {
		return render(draft, {
			parent: actionIds.openSwapCheckout,
			home: actionIds.openHome,
		})
	},
}

function render(draft: Draft, back: NavIds): PageContent {
	return {
		message: buildMessage(draft),
		keyboard: buildKeyboard(draft.srcBalance, back),
	}
}

function buildMessage(draft: Draft): string {
	const { srcCurrency, srcBalance, dstCurrency } = draft

	const srcChainName = chainToName(srcCurrency.chainAddress.chain)
	const dstChainName = chainToName(dstCurrency.chainAddress.chain)

	return [
		swapBreadcrumb(),
		'',
		`From: ${srcChainName} ${srcCurrency.symbol}`,
		`To: ${dstChainName} ${dstCurrency.symbol}`,
		'',
		`Your ${srcChainName} balance:`,
		formatAmount(srcBalance),
		'',
		'Choose amount:',
	].join('\n')
}

function formatAmount(amount: CurrencyAmountDto): string {
	const { displayAmount, symbol } = currencyAmountDisplayParts(amount)

	return `${displayAmount} ${symbol}`
}

function buildKeyboard(
	srcBalance: CurrencyAmountDto,
	back: NavIds,
): InlineKeyboard {
	const maxAmount = formatUnits(
		BigInt(srcBalance.amount),
		srcBalance.currency.decimals,
	)

	const keyboard = new InlineKeyboard()
		.text('Max', buildActionData(actionIds.submitSwapAmount, maxAmount))
		.row()
		.text(
			'Custom amount',
			buildActionData(actionIds.promptSwapAmount, undefined),
		)

	return addNav(keyboard, back)
}
