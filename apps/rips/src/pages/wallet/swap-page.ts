import { InlineKeyboard } from 'grammy'
import { CurrencyAmountDto } from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { buildActionData } from '../../utils/action-data'
import { swapBreadcrumb } from '../../utils/breadcrumb'
import { formatAmountWithUsd } from '../../utils/currency'
import { addNav } from '../../utils/keyboard'
import { tokenLabel } from '../../utils/swap-utils'

export class SwapPage {
	static render(args: {
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
				buildActionData(actionIds.showSwapChooseChain, 'in'),
			)
			.row()
			.text(
				'Select token out',
				buildActionData(actionIds.showSwapChooseChain, 'out'),
			)
			.row()

		if (currencyInBalance !== undefined) {
			keyboard.text('Choose amount', actionIds.showSwapChooseAmount).row()
		}

		addNav(keyboard, {
			parent: actionIds.showWallet,
			home: actionIds.showHome,
		})

		return { message: lines.join('\n'), keyboard }
	}
}
