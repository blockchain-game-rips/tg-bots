import { InlineKeyboard } from 'grammy'
import { CurrencyAmountDto } from '../../../generated/api-client'
import { buildActionData } from '../../grammy-kit/action/action-data'
import { actionIds } from '../../grammy-kit/action/actions'
import { addNav } from '../../grammy-kit/keyboard/keyboard'
import { PageContent } from '../../types'
import { swapBreadcrumb } from '../../utils/breadcrumb'
import { formatAmountWithUsd, formatUnits } from '../../utils/currency'
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
