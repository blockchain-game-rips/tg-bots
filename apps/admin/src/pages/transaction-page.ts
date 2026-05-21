import { AdminTransactionResponseDtoOutput } from '@rips/api-client'
import { formatAmountWithUsd } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../actions'
import { PageContent } from '../types'

export class TransactionPage {
	static render(
		title: string,
		tx: AdminTransactionResponseDtoOutput,
	): PageContent {
		const lines = [
			`<b>${title}</b>`,
			'',
			`Tx: <code>${tx.transaction.id}</code>`,
		]

		if (tx.transaction.cost !== undefined) {
			lines.push(`Fee: ${formatAmountWithUsd(tx.transaction.cost)}`)
		}

		const keyboard = new InlineKeyboard().text('Home', actionIds.openHome)

		return { message: lines.join('\n'), keyboard }
	}
}
