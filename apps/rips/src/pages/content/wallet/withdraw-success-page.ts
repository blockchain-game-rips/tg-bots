import { InlineKeyboard } from 'grammy'
import { TransactionDto } from '../../../../generated/api-client'
import { actionIds } from '../../../actions'
import { PageContent } from '../../../types'

export class WithdrawSuccessPage {
	static render(transaction: TransactionDto): PageContent {
		const lines = [
			`✅ Withdrawal successful!`,
			'',
			`Transaction: ${transaction.id}`,
		]

		return {
			message: lines.join('\n'),
			keyboard: new InlineKeyboard().text('Home', actionIds.showHome),
		}
	}
}
