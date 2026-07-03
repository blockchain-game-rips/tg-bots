import { CurrencyAmountDto } from '@rips/api-client'
import { addNav, buildActionData } from '@rips/grammy-kit'
import {
	formatAmountWithUsd,
	formatUnits,
	swapBreadcrumb,
	tokenLabel,
} from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { chainToName } from '../../utils/chain'

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
			`Token in: ${tokenLabel(currencyInBalance, chainToName)}`,
			currencyOutBalance
				? `Token out: ${tokenLabel(currencyOutBalance, chainToName)}`
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
