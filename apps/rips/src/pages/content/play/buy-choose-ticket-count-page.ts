import { InlineKeyboard } from 'grammy'
import { AvailableStakeDto } from '../../../../generated/api-client'
import { actionIds } from '../../../actions'
import { PageContent } from '../../../types'
import { buildActionData } from '../../../utils/action-data'
import { addNav } from '../../../utils/keyboard'
import { configName, resolveConfig } from '../../../utils/stake'

export class BuyChooseTicketCountPage {
	static render(availableStake: AvailableStakeDto): PageContent {
		const config = resolveConfig(availableStake)

		const keyboard = new InlineKeyboard()
			.text('1 Ticket', buildActionData(actionIds.showBuyCheckout, '1'))
			.row()
			.text('3 Tickets', buildActionData(actionIds.showBuyCheckout, '3'))
			.row()
			.text('Custom Amount', actionIds.requestCustomTicketAmount)

		return {
			message: `Choose how many tickets to buy at ${configName(config)} each.`,
			keyboard: addNav(keyboard, {
				home: actionIds.showHome,
				parent: actionIds.showChooseStake,
			}),
		}
	}
}
