import { InlineKeyboard } from 'grammy'
import { CurrencyAmountDto } from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { buildActionData } from '../../utils/action-data'
import { swapBreadcrumb } from '../../utils/breadcrumb'
import { formatAmountWithUsd, formatUnits } from '../../utils/currency'
import { addNav } from '../../utils/keyboard'
import { tokenLabel } from '../../utils/swap-utils'

export const SwapChooseAmountPage = {
	render(args: {
		currencyInBalance: CurrencyAmountDto
		currencyOutBalance?: CurrencyAmountDto
	}): PageContent {
		const { currencyInBalance, currencyOutBalance } = args

		const maxAmount = formatUnits(
			BigInt(currencyInBalance.amount),
			currencyInBalance.currency.decimals,
		)

		const lines = [
			swapBreadcrumb(),
			'',
			`Token in: ${tokenLabel(currencyInBalance)}`,
			currencyOutBalance
				? `Token out: ${tokenLabel(currencyOutBalance)}`
				: 'Token out: -',
			`Balance: ${formatAmountWithUsd(currencyInBalance)}`,
			'',
			'Choose amount to swap:',
		]

		const keyboard = new InlineKeyboard()
			.text(
				'Swap Max',
				buildActionData(actionIds.submitSwapAmount, maxAmount),
			)
			.row()
			.text(
				'Custom amount',
				buildActionData(actionIds.promptSwapAmount, undefined),
			)
			.row()

		addNav(keyboard, {
			parent: actionIds.openSwap,
			home: actionIds.openHome,
		})

		return { message: lines.join('\n'), keyboard }
	},
}
