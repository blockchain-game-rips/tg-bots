import { InlineKeyboard } from 'grammy'
import { CurrencyAmountDto } from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { Chain, PageContent } from '../../types'
import { buildActionData } from '../../utils/action-data'
import { withdrawBreadcrumb } from '../../utils/breadcrumb'
import { chainToName } from '../../utils/chain'
import { formatAmountWithUsd } from '../../utils/currency'

export class WithdrawPage {
	static render(
		currencyBalance: CurrencyAmountDto,
		amountToWithdraw?: CurrencyAmountDto,
		recipientAddress?: string,
	): PageContent {
		const { currency } = currencyBalance
		const chain = currency.chainAddress.chain

		const amount =
			amountToWithdraw !== undefined
				? formatAmountWithUsd(amountToWithdraw)
				: '-'

		const recipient =
			recipientAddress !== undefined ? recipientAddress : '-'

		const lines = [
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
			.row()
			.text(
				'Back',
				buildActionData(
					actionIds.openWithdrawChooseToken,
					chain as Chain,
				),
			)
			.text('Home', buildActionData(actionIds.openHome, undefined))

		return { message: lines.join('\n'), keyboard }
	}
}
