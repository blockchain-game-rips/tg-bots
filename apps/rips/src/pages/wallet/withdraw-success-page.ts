import { InlineKeyboard } from 'grammy'
import { TransactionDto } from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { messageFromLines } from '../../utils/message'

export class WithdrawSuccessPage {
	static render(transaction: TransactionDto): PageContent {
		const lines = [
			`✅ Withdrawal successful!`,
			'',
			`Transaction: ${transaction.id}`,
		]

		return {
			message: messageFromLines(lines),
			keyboard: new InlineKeyboard().text('Home', actionIds.showHome),
		}
	}
}
