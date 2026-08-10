import { AdminTransactionResponseDtoOutput } from '@rips/api-client'
import { fmt, FormattedString, joinLines, Line } from '@rips/grammy-kit'
import { formatAmountWithUsd } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../actions'
import { PageContent } from '../types'

export const TransactionPage = {
	render(title: string, tx: AdminTransactionResponseDtoOutput): PageContent {
		const lines: Line[] = [
			FormattedString.b(title),
			'',
			fmt`Tx: ${FormattedString.code(tx.transaction.id)}`,
			`Fee: ${formatAmountWithUsd(tx.transaction.cost)}`,
		]

		const keyboard = new InlineKeyboard().text('Home', actionIds.openHome)

		return { message: joinLines(lines), keyboard }
	},
}
