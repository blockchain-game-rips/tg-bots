import { InlineKeyboard } from 'grammy'
import { Balance } from '../../api/schemas'
import { buildCommand } from '../../commands'
import { promptIds } from '../../prompts/prompt-ids'
import { PageContent } from '../../types'
import { formatUnits } from '../../utils/units'
import { pageIds } from '../page-ids'
import { addNav } from '../utils'

export const MAX_AMOUNT_PAYLOAD = 'max'

export class ChooseWithdrawAmountPage {
	static render(balance: Balance): PageContent {
		const amount = formatUnits(
			BigInt(balance.amount),
			balance.currency.decimals,
		)

		return {
			message: `Balance: ${amount} ${balance.currency.symbol}\n\nChoose amount to withdraw:`,
			keyboard: addNav(
				new InlineKeyboard()
					.text(
						`Max (${amount} ${balance.currency.symbol})`,
						buildCommand({
							type: 'open',
							pageId: pageIds.chooseWithdrawAmount,
							payloads: [MAX_AMOUNT_PAYLOAD],
						}),
					)
					.text(
						'Custom amount',
						buildCommand({
							type: 'reply',
							promptId: promptIds.customWithdrawAmount,
						}),
					),
				{ home: pageIds.home, parent: pageIds.wallet },
			),
		}
	}
}
