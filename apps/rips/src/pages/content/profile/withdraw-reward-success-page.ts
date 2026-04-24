import { InlineKeyboard } from 'grammy'
import { WithdrawRewardResponseDtoOutput } from '../../../../generated/api-client'
import { PageContent } from '../../../types'
import { formattedAmountWithUsd } from '../../../utils/units'
import { pageIds } from '../../page-ids'
import { addNav } from '../../utils'

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
			message: lines.join('\n'),
			keyboard: addNav(new InlineKeyboard(), {
				parent: pageIds.referralSystem,
				home: pageIds.home,
			}),
		}
	}
}
