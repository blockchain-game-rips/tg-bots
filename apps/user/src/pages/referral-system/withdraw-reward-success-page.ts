import { WithdrawRewardResponseDtoOutput } from '@rips/api-client'
import { joinLines } from '@rips/grammy-kit'
import { formatAmountWithUsd } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'

export const WithdrawRewardSuccessPage = {
	render(response: WithdrawRewardResponseDtoOutput): PageContent {
		const lines = [
			'✅ Reward claimed successfully!',
			'',
			`Amount: ${formatAmountWithUsd(response.amount)}`,
		]

		if (response.transaction.cost !== undefined) {
			lines.push(
				`Network fee: ${formatAmountWithUsd(response.transaction.cost)}`,
			)
		}

		return {
			message: joinLines(lines),
			keyboard: new InlineKeyboard().appendNavButtons({
				parent: actionIds.openReferral,
				home: actionIds.openHome,
			}),
		}
	},
}
