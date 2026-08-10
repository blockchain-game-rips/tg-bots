import { WithdrawRewardResponseDtoOutput } from '@rips/api-client'
import { joinLines, Line } from '@rips/grammy-kit'
import { formatAmountWithUsd } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { PageContent } from '../../types'
import { referralBreadcrumb } from '../../utils/display/breadcrumb'
import { transactionOutcomeLines } from '../../utils/display/transaction-outcome'

export const WithdrawRewardSuccessPage = {
	render(response: WithdrawRewardResponseDtoOutput): PageContent {
		const lines: Line[] = [
			referralBreadcrumb('Claim'),
			'',
			'✅ Reward claimed',
			'',
			'Amount:',
			formatAmountWithUsd(response.amount),
			'',
			...transactionOutcomeLines({
				kind: 'singleChain',
				transaction: response.transaction,
			}),
		]

		return {
			message: joinLines(lines),
			keyboard: new InlineKeyboard().appendHomeButton(),
		}
	},
}
