import { WithdrawRewardResponseDtoOutput } from '@rips/api-client'
import { addNav } from '@rips/grammy-kit'
import { formatAmountWithUsd } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'

export const WithdrawRewardSuccessPage = {
	render(response: WithdrawRewardResponseDtoOutput): PageContent {
		const lines = [
			'✅ Reward withdrawn successfully!',
			'',
			`Amount: ${formatAmountWithUsd(response.amount)}`,
		]

		if (response.transaction.cost !== undefined) {
			lines.push(
				`Network fee: ${formatAmountWithUsd(response.transaction.cost)}`,
			)
		}

		return {
			message: lines.join('\n'),
			keyboard: addNav(new InlineKeyboard(), {
				parent: actionIds.openReferral,
				home: actionIds.openHome,
			}),
		}
	},
}
