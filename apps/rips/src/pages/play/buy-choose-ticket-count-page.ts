import { InlineKeyboard } from 'grammy'
import { AvailableStakeDto } from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { buildActionData } from '../../utils/action-data'
import { addNav } from '../../utils/keyboard'
import { configName, resolveConfig } from '../../utils/stake'

export class BuyChooseTicketCountPage {
	static render(availableStake: AvailableStakeDto): PageContent {
		const config = resolveConfig(availableStake)

		const keyboard = new InlineKeyboard()
			.text('1 Ticket', buildActionData(actionIds.openBuyCheckout, 1))
			.row()
			.text('3 Tickets', buildActionData(actionIds.openBuyCheckout, 3))
			.row()
			.text(
				'Custom Amount',
				buildActionData(actionIds.promptTicketCount, undefined),
			)

		return {
			message: [
				'<b>🎮 Buy Tickets</b>',
				'',
				`Stake: ${configName(config)}`,
				'',
				'Select ticket count:',
			].join('\n'),
			keyboard: addNav(keyboard, {
				home: actionIds.openHome,
				parent: actionIds.openChooseStake,
			}),
		}
	}
}
