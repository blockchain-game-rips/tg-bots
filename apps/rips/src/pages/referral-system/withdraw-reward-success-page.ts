import { InlineKeyboard } from 'grammy'
import { WithdrawRewardResponseDtoOutput } from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { formatAmountWithUsd } from '../../utils/currency'
import { addNav } from '../../utils/keyboard'

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
