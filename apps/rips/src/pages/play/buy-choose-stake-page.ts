import { AvailableStakeDto } from '@rips/api-client'
import { addNav, buildActionData } from '@rips/grammy-kit'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { configName, resolveConfig } from '../../utils/stake'

export const BuyChooseStakePage = {
	render(availableStakes: AvailableStakeDto[]): PageContent {
		const keyboard = new InlineKeyboard()

		for (const availableStake of availableStakes) {
			const config = resolveConfig(availableStake)

			keyboard
				.text(
					configName(config),
					buildActionData(
						actionIds.openChooseTicketAmount,
						availableStake.stake.id,
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
	},
}
