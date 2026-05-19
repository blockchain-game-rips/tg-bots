import { CurrencyAmountDto } from '@rips/api-client'
import { addNav, buildActionData } from '@rips/grammy-kit'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { swapBreadcrumb } from '../../utils/display/breadcrumb'
import { tokenLabel } from '../../utils/display/token'
import { formatAmountWithUsd } from '../../utils/format/currency'

export const SwapPage = {
	render(args: {
		currencyInBalance?: CurrencyAmountDto
		currencyOutBalance?: CurrencyAmountDto
		amountIn?: CurrencyAmountDto
	}): PageContent {
		const { currencyInBalance, currencyOutBalance, amountIn } = args

		const tokenIn = currencyInBalance ? tokenLabel(currencyInBalance) : '-'
		const tokenOut = currencyOutBalance
			? tokenLabel(currencyOutBalance)
			: '-'
		const amount = amountIn ? formatAmountWithUsd(amountIn) : '-'

		const lines = [
			swapBreadcrumb(),
			'',
			'Token in:',
			tokenIn,
			'',
			'Token out:',
			tokenOut,
			'',
			'Amount in:',
			amount,
		]

		const keyboard = new InlineKeyboard()
			.text(
				'Select token in',
				buildActionData(actionIds.openSwapChooseChainIn, undefined),
			)
			.row()
			.text(
				'Select token out',
				buildActionData(actionIds.openSwapChooseChainOut, undefined),
			)
			.row()

		if (currencyInBalance !== undefined) {
			keyboard
				.text(
					'Choose amount',
					buildActionData(actionIds.openSwapChooseAmount, undefined),
				)
				.row()
		}

		addNav(keyboard, {
			parent: actionIds.openWallet,
			home: actionIds.openHome,
		})

		return { message: lines.join('\n'), keyboard }
	},
}
