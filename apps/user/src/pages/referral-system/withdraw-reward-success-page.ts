import { CurrencyAmountDtoOutput, TransactionDtoOutput } from '@rips/api-client'
import { joinLines, Line } from '@rips/grammy-kit'
import { formatAmountWithUsd } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { PageContent } from '../../types'
import { referralBreadcrumb } from '../../utils/display/breadcrumb'
import { transactionOutcomeLines } from '../../utils/display/transaction-outcome'

interface WithdrawRewardSuccessArgs {
	amount: CurrencyAmountDtoOutput
	transaction: TransactionDtoOutput
}

export const WithdrawRewardSuccessPage = {
	render(args: WithdrawRewardSuccessArgs): PageContent {
		const lines: Line[] = [
			referralBreadcrumb('Claim'),
			'',
			'✅ Reward claimed',
			'',
			'Amount:',
			formatAmountWithUsd(args.amount),
			'',
			...transactionOutcomeLines({
				kind: 'singleChain',
				transaction: args.transaction,
			}),
		]

		return {
			message: joinLines(lines),
			keyboard: new InlineKeyboard().appendHomeButton(),
		}
	},
}
