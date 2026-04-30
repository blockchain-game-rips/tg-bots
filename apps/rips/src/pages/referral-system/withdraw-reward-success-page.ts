import { InlineKeyboard } from 'grammy'
import { WithdrawRewardResponseDtoOutput } from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { formatAmountWithUsd } from '../../utils/currency'
import { addNav } from '../../utils/keyboard'
import { messageFromLines } from '../../utils/message'

export class WithdrawRewardSuccessPage {
	static render(response: WithdrawRewardResponseDtoOutput): PageContent {
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
			message: messageFromLines(lines),
			keyboard: addNav(new InlineKeyboard(), {
				parent: actionIds.showReferral,
				home: actionIds.showHome,
			}),
		}
	}
}
