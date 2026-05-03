import { InlineKeyboard } from 'grammy'
import { AvailableStakeDto } from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { buildActionData } from '../../utils/action-data'
import { addNav } from '../../utils/keyboard'
import { configName, resolveConfig } from '../../utils/stake'

export class BuyChooseStakePage {
	static render(availableStakes: AvailableStakeDto[]): PageContent {
		const keyboard = new InlineKeyboard()

		for (const availableStake of availableStakes) {
			const config = resolveConfig(availableStake)

			keyboard
				.text(
					configName(config),
					buildActionData(
						actionIds.openChooseTicketAmount,
						availableStake.stake.id.toString(),
					),
				)
				.row()
		}

		return {
			message: ['<b>🎮 Buy Tickets</b>', '', 'Select a stake:'].join(
				'\n',
			),
			keyboard: addNav(keyboard, {
				home: actionIds.openHome,
				parent: actionIds.openPlay,
			}),
		}
	}
}
