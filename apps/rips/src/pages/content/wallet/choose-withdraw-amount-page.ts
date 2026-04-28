import { InlineKeyboard } from 'grammy'
import { CurrencyAmountDto } from '../../../../generated/api-client'
import { actionIds } from '../../../actions'
import { PageContent } from '../../../types'
import { formatUnits, toUsd } from '../../../utils/units'
import { addNav, buildActionData } from '../../utils'

export const MAX_AMOUNT_PAYLOAD = 'max'

export class ChooseWithdrawAmountPage {
	static render(balance: CurrencyAmountDto): PageContent {
		const formattedBalance = formatUnits(
			BigInt(balance.amount),
			balance.currency.decimals,
		)

		return {
			message: `Balance: ${formattedBalance} ${balance.currency.symbol} ${toUsd(balance)}\n\nChoose amount to withdraw:`,
			keyboard: addNav(
				new InlineKeyboard()
					.text(
						'Withdraw Max',
						buildActionData(
							actionIds.showChooseWithdrawAmount,
							MAX_AMOUNT_PAYLOAD,
						),
					)
					.row()
					.text(
						'Custom amount',
						actionIds.requestWithdrawCustomAmount,
					),
				{ home: actionIds.showHome, parent: actionIds.showWithdraw },
			),
		}
	}
}
