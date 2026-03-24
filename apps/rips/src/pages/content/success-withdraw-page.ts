import { InlineKeyboard } from 'grammy'
import { Balance, Withdraw } from '../../api/schemas'
import { buildCommand } from '../../commands'
import { PageContent } from '../../types'
import { formatUnits } from '../../utils/units'
import { pageIds } from '../page-ids'

export class SuccessWithdrawPage {
	static render(
		withdraw: Withdraw,
		amount: bigint,
		balance: Balance,
	): PageContent {
		const { decimals, symbol } = balance.currency
		const formatted = formatUnits(amount, decimals)

		return {
			message:
				`✅ Withdrawal successful!\n\n` +
				`Amount: ${formatted} ${symbol}\n` +
				`Tx: ${withdraw.txId}`,
			keyboard: new InlineKeyboard().text(
				'Home',
				buildCommand({ type: 'open', pageId: pageIds.home }),
			),
		}
	}
}
