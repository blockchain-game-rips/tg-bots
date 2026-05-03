import { InlineKeyboard } from 'grammy'
import { CurrencyAmountDto } from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
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
			'<b>🔄 Swap</b>',
			'',
			'Token in:',
			tokenIn,
			'',
			'Token out:',
			tokenOut,
			'',
			'Amount:',
			amount,
		]

		const keyboard = new InlineKeyboard()
			.text('Select token in', actionIds.showSwapChooseChain)
			.row()
			.text('Select token out', actionIds.showSwapChooseChain)
			.row()

		addNav(keyboard, {
			parent: actionIds.showWallet,
			home: actionIds.showHome,
		})

		return { message: lines.join('\n'), keyboard }
	}
}
