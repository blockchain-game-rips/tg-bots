import { InlineKeyboard } from 'grammy'
import { CurrencyAmountDto } from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { buildActionData } from '../../utils/action-data'
import { swapBreadcrumb } from '../../utils/breadcrumb'
import { formatAmountWithUsd, formatUnits } from '../../utils/currency'
import { addNav } from '../../utils/keyboard'
import { tokenLabel } from '../../utils/swap-utils'

export class SwapChooseAmountPage {
	static render(args: {
		currencyInBalance: CurrencyAmountDto
		currencyOutBalance?: CurrencyAmountDto
	}): PageContent {
		const { currencyInBalance, currencyOutBalance } = args

		const maxPayload = formatUnits(
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
				buildActionData(actionIds.showSwap, maxPayload),
			)
			.row()
			.text('Custom amount', actionIds.askSwapAmount)
			.row()

		addNav(keyboard, {
			parent: actionIds.showSwap,
			home: actionIds.showHome,
		})

		return { message: lines.join('\n'), keyboard }
	}
}
