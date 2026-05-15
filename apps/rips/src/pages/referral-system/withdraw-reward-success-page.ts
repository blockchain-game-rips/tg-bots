import { InlineKeyboard } from 'grammy'
import { WithdrawRewardResponseDtoOutput } from '../../../generated/api-client'
import { actionIds } from '../../grammy-kit/action/actions'
import { addNav } from '../../grammy-kit/keyboard/keyboard'
import { PageContent } from '../../types'
import { formatAmountWithUsd } from '../../utils/currency'

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
