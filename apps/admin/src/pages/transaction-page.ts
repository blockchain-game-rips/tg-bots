import {
	AdminTransactionResponseDtoOutput,
	TransactionDtoOutput,
} from '@rips/api-client'
import { fmt, FormattedString, joinLines, Line } from '@rips/grammy-kit'
import { formatAmountWithUsd } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../action-ids'
import { PageContent } from '../types'

const ERROR_PREFIX = '❌ Error:'

export interface TransactionTitles {
	/** Past tense, asserting the change happened. Only shown on success. */
	succeeded: string

	/** Gerund naming the write, so it reads inside a failure sentence. */
	operation: string
}

export const TransactionPage = {
	render(
		titles: TransactionTitles,
		tx: AdminTransactionResponseDtoOutput,
	): PageContent {
		const { transaction } = tx

		const lines: Line[] =
			transaction.status === 'succeeded'
				? successLines(titles.succeeded, transaction.transaction)
				: failureLines(titles.operation, transaction.status)

		const keyboard = new InlineKeyboard().text('Home', actionIds.openHome)

		return { message: joinLines(lines), keyboard }
	},
}

function successLines(
	title: string,
	transaction: TransactionDtoOutput,
): Line[] {
	return [
		FormattedString.b(title),
		'',
		fmt`Tx: ${FormattedString.code(transaction.id)}`,
		`Fee: ${formatAmountWithUsd(transaction.cost)}`,
	]
}

function failureLines(
	operation: string,
	status: 'not-sent' | 'reverted' | 'unknown',
): Line[] {
	return [fmt`${ERROR_PREFIX} ${failureMessage(operation, status)}`]
}

function failureMessage(
	operation: string,
	status: 'not-sent' | 'reverted' | 'unknown',
): string {
	switch (status) {
		case 'not-sent':
			return `${operation} didn’t go through. Nothing was sent — you can try again.`

		case 'reverted':
			return `${operation} didn’t go through. The transaction failed on-chain, so the network fee was still charged.`

		case 'unknown':
			return `We couldn’t confirm whether ${lowerFirst(operation)} went through. Check the current state before trying again.`
	}
}

// the gerund opens two of the three sentences and sits mid-sentence in the third
function lowerFirst(operation: string): string {
	return operation.charAt(0).toLowerCase() + operation.slice(1)
}
