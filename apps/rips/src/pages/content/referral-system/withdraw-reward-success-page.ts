import { InlineKeyboard } from 'grammy'
import { WithdrawRewardResponseDtoOutput } from '../../../../generated/api-client'
import { actionIds } from '../../../actions'
import { PageContent } from '../../../types'
import { formattedAmountWithUsd } from '../../../utils/units'
import { addNav, messageFromLines } from '../../utils'

export class WithdrawRewardSuccessPage {
	static render(response: WithdrawRewardResponseDtoOutput): PageContent {
		const lines = [
			'✅ Reward withdrawn successfully!',
			'',
			`Amount: ${formattedAmountWithUsd(response.amount)}`,
		]

		if (response.transaction.cost !== undefined) {
			lines.push(
				`Network fee: ${formattedAmountWithUsd(response.transaction.cost)}`,
			)
		}

		return {
			message: messageFromLines(lines),
			keyboard: addNav(new InlineKeyboard(), {
				parent: actionIds.showReferral,
				home: actionIds.showHome,
			}),
		}
	}
}
