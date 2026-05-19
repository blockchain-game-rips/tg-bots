import { addNav, buildActionData } from '@rips/grammy-kit'
import { InlineKeyboard } from 'grammy'
import { CurrencyAmountDto } from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { formatUnits } from '../../utils/currency'
import { swapBreadcrumb } from '../../utils/display/breadcrumb'
import { tokenLabel } from '../../utils/display/token'
import { formatAmountWithUsd } from '../../utils/format/currency'

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
