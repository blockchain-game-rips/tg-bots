import { InlineKeyboard } from 'grammy'
import { Balance } from '../../api/schemas'
import { buildCommand } from '../../commands'
import { PageContent } from '../../types'
import { formatUnits } from '../../utils/units'
import { pageIds } from '../page-ids'

export class ConfirmWithdrawPage {
	static render(
		amount: bigint,
		recipientAddress: string,
		balance: Balance,
	): PageContent {
		const formatted = formatUnits(amount, balance.currency.decimals)

		return {
			message:
				`Amount: ${formatted} ${balance.currency.symbol}\n` +
				`To: ${recipientAddress}\n\n` +
				`Confirm withdrawal?`,
			keyboard: new InlineKeyboard()
				.text(
					'Confirm',
					buildCommand({
						type: 'open',
						pageId: pageIds.successWithdraw,
					}),
				)
				.row()
				.text(
					'Back',
					buildCommand({
						type: 'open',
						pageId: pageIds.chooseWithdrawAmount,
					}),
				)
				.text(
					'Home',
					buildCommand({ type: 'open', pageId: pageIds.home }),
				),
		}
	}
}
