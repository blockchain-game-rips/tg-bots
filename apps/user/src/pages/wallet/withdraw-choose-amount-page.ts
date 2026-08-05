import { CurrencyAmountDto } from '@rips/api-client'
import { buildActionData, joinLines, Line } from '@rips/grammy-kit'
import { formatAmountWithUsd, formatUnits } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { chainToName, currencyToChain } from '../../utils/chain'
import { withdrawBreadcrumb } from '../../utils/display/breadcrumb'

export const WithdrawChooseAmountPage = {
	render(balance: CurrencyAmountDto): PageContent {
		const { currency } = balance
		const chain = currencyToChain(currency)

		const maxAmount = formatUnits(BigInt(balance.amount), currency.decimals)

		const lines: Line[] = [
			withdrawBreadcrumb(chainToName(chain), currency.symbol),
			'',
			`Balance: ${formatAmountWithUsd(balance)}`,
			'',
			'Choose amount to withdraw:',
		]

		const keyboard = new InlineKeyboard()
			.text(
				'Withdraw Max',
				buildActionData(actionIds.submitWithdrawAmount, maxAmount),
			)
			.row()
			.text(
				'Custom amount',
				buildActionData(actionIds.promptWithdrawAmount, undefined),
			)
			.row()

		keyboard.appendNavButtons({
			parent: actionIds.openWithdrawChooseCurrency,
			parentPayload: chain,
			home: actionIds.openHome,
		})

		return { message: joinLines(lines), keyboard }
	},
}
