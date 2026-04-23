import { InlineKeyboard } from 'grammy'
import { CurrencyAmountDto } from '../../../../generated/api-client'
import { buildCommand } from '../../../button-handler/utils'
import { promptIds } from '../../../prompts/prompt-ids'
import { PageContent } from '../../../types'
import { formatUnits, toUsd } from '../../../utils/units'
import { pageIds } from '../../page-ids'
import { addNav } from '../../utils'

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
						`Withdraw Max`,
						buildCommand({
							type: 'open',
							pageId: pageIds.chooseWithdrawAmount,
							payloads: [MAX_AMOUNT_PAYLOAD],
						}),
					)
					.row()
					.text(
						'Custom amount',
						buildCommand({
							type: 'reply',
							promptId: promptIds.customWithdrawAmount,
						}),
					),
				{ home: pageIds.home, parent: pageIds.withdraw },
			),
		}
	}
}
