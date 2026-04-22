import { InlineKeyboard } from 'grammy'
import { TransactionDto } from '../../../generated/api-client'
import { buildCommand } from '../../button-handler/utils'
import { PageContent } from '../../types'
import { pageIds } from '../page-ids'

export class SuccessWithdrawPage {
	static render(transaction: TransactionDto): PageContent {
		const lines = [
			`✅ Withdrawal successful!`,
			'',
			`Transaction: ${transaction.id}`,
		]

		return {
			message: lines.join('\n'),
			keyboard: new InlineKeyboard().text(
				'Home',
				buildCommand({
					type: 'open',
					pageId: pageIds.home,
					payloads: [],
				}),
			),
		}
	}
}
