import { CurrencyAmountDtoOutput, TransactionDtoOutput } from '@rips/api-client'
import { FormattedString, joinLines, Line } from '@rips/grammy-kit'
import { formatAmountWithUsd } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { PageContent } from '../../types'
import { currencyToChain } from '@rips/shared'
import { chainToName } from '../../utils/chain'
import { withdrawBreadcrumb } from '../../utils/display/breadcrumb'
import { transactionOutcomeLines } from '../../utils/display/transaction-outcome'

export const WithdrawSuccessPage = {
	render(args: {
		transaction: TransactionDtoOutput
		currencyAmount: CurrencyAmountDtoOutput
		recipientAddress: string
	}): PageContent {
		const { transaction, currencyAmount, recipientAddress } = args

		const { currency } = currencyAmount
		const chain = currencyToChain(currency)

		const lines: Line[] = [
			withdrawBreadcrumb(chainToName(chain), currency.symbol),
			'',
			'✅ Withdrawal sent',
			'',
			`${formatAmountWithUsd(currencyAmount)} sent to`,
			FormattedString.code(recipientAddress),
			'',
			...transactionOutcomeLines({ kind: 'singleChain', transaction }),
		]

		return {
			message: joinLines(lines),
			keyboard: new InlineKeyboard().appendHomeButton(),
		}
	},
}
