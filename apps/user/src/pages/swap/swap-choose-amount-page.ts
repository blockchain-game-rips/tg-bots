import { CurrencyAmountDtoOutput, CurrencyDtoOutput } from '@rips/api-client'
import {
	buildActionData,
	FormattedString,
	joinLines,
	Line,
} from '@rips/grammy-kit'
import { currencyAmountDisplayParts } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../action-ids'
import { PageContent } from '../../types'
import { currencyToChainName } from '../../utils/chain'
import { swapBreadcrumb } from '../../utils/display/breadcrumb'
import * as labels from '../../utils/button-labels'

interface Draft {
	srcBalance: CurrencyAmountDtoOutput
	dstCurrency: CurrencyDtoOutput
}

export const SwapChooseAmountPage = {
	render(draft: Draft): PageContent {
		return {
			message: buildMessage(draft),
			keyboard: buildKeyboard(),
		}
	},
}

function buildMessage(draft: Draft): FormattedString {
	const { srcBalance, dstCurrency } = draft

	const srcCurrency = srcBalance.currency
	const srcChainName = currencyToChainName(srcCurrency)
	const dstChainName = currencyToChainName(dstCurrency)

	const lines: Line[] = [
		swapBreadcrumb(),
		'',
		`From: ${srcChainName} ${srcCurrency.symbol}`,
		`To: ${dstChainName} ${dstCurrency.symbol}`,
		'',
		`Your ${srcChainName} balance:`,
		formatAmount(srcBalance),
		'',
		'Choose amount:',
	]

	return joinLines(lines)
}

function formatAmount(amount: CurrencyAmountDtoOutput): string {
	const { displayAmount, symbol } = currencyAmountDisplayParts(amount)

	return `${displayAmount} ${symbol}`
}

function buildKeyboard(): InlineKeyboard {
	const keyboard = new InlineKeyboard()
		.text(
			labels.MAX,
			buildActionData(actionIds.openSwapCheckoutFromAmount, {
				kind: 'max',
			}),
		)
		.row()
		.text(
			labels.CUSTOM_AMOUNT,
			buildActionData(actionIds.promptSwapAmount, undefined),
		)

	return keyboard.appendNavButtons()
}
