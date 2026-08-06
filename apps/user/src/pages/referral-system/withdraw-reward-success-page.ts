import { WithdrawRewardResponseDtoOutput } from '@rips/api-client'
import { fmt, FormattedString, joinLines, Line } from '@rips/grammy-kit'
import { formatAmountWithUsd } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { PageContent } from '../../types'
import { referralBreadcrumb } from '../../utils/display/breadcrumb'

export const WithdrawRewardSuccessPage = {
	render(response: WithdrawRewardResponseDtoOutput): PageContent {
		const lines: Line[] = [
			referralBreadcrumb('Claim'),
			'',
			'✅ Reward claimed successfully!',
			'',
			`Amount: ${formatAmountWithUsd(response.amount)}`,
		]

		if (response.transaction.cost !== undefined) {
			lines.push(
				`Blockchain fee: ${formatAmountWithUsd(response.transaction.cost)}`,
			)
		}

		lines.push(
			'',
			fmt`Transaction: ${FormattedString.code(response.transaction.id)}`,
		)

		return {
			message: joinLines(lines),
			keyboard: new InlineKeyboard().appendHomeButton(),
		}
	},
}
