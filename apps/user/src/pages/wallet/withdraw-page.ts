import { CurrencyAmountDto } from '@rips/api-client'
import { buildActionData, joinLines, Line } from '@rips/grammy-kit'
import { formatAmountWithUsd } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { chainToName, currencyToChain } from '../../utils/chain'
import { withdrawBreadcrumb } from '../../utils/display/breadcrumb'

export const WithdrawPage = {
	render(
		currencyBalance: CurrencyAmountDto,
		amountToWithdraw?: CurrencyAmountDto,
		recipientAddress?: string,
	): PageContent {
		const { currency } = currencyBalance
		const chain = currencyToChain(currency)

		const amount =
			amountToWithdraw !== undefined
				? formatAmountWithUsd(amountToWithdraw)
				: '-'

		const recipient = recipientAddress ?? '-'

		const lines: Line[] = [
			withdrawBreadcrumb(chainToName(chain), currency.symbol),
			'',
			`Balance: ${formatAmountWithUsd(currencyBalance)}`,
			'',
			'Amount',
			amount,
			'',
			'Recipient',
			recipient,
		]

		const keyboard = new InlineKeyboard()
			.text(
				'Enter amount',
				buildActionData(actionIds.openWithdrawChooseAmount, undefined),
			)
			.row()
			.text(
				'Enter recipient',
				buildActionData(actionIds.promptWithdrawRecipient, undefined),
			)
			.appendNavButtons({
				home: actionIds.openHome,
				parent: actionIds.openWithdrawChooseCurrency,
				parentPayload: chain,
			})

		return { message: joinLines(lines), keyboard }
	},
}
