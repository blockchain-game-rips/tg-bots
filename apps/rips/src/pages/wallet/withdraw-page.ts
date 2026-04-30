import { InlineKeyboard } from 'grammy'
import { CurrencyAmountDto } from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { addNav } from '../../utils/keyboard'
import { messageFromLines } from '../../utils/message'

export class WithdrawPage {
	static render(
		currencyBalance: CurrencyAmountDto,
		amountToWithdraw?: CurrencyAmountDto,
		recipientAddress?: string,
	): PageContent {
		const lines = []
		lines.push('withdraw page')
		return {
			message: messageFromLines(lines),
			keyboard: addNav(new InlineKeyboard(), {
				home: actionIds.showHome,
				parent: actionIds.showWallet,
			}),
		}
	}
}
