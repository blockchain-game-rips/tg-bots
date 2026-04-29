import { InlineKeyboard } from 'grammy'
import { AvailableStakeDto } from '../../../../generated/api-client'
import { actionIds } from '../../../actions'
import { PageContent } from '../../../types'
import { buildActionData } from '../../../utils/action-data'
import { addNav } from '../../../utils/keyboard'
import { configName, resolveConfig } from '../../../utils/stake'

export class BuyChooseStakePage {
	static render(availableStakes: AvailableStakeDto[]): PageContent {
		const keyboard = new InlineKeyboard()

		for (const availableStake of availableStakes) {
			const config = resolveConfig(availableStake)

			keyboard
				.text(
					configName(config),
					buildActionData(
						actionIds.showChooseTicketAmount,
						availableStake.stake.id.toString(),
					),
				)
				.row()
		}

		return {
			message:
				'Choose your stake — the higher the ticket price, the bigger the potential reward.',
			keyboard: addNav(keyboard, {
				home: actionIds.showHome,
				parent: actionIds.showPlay,
			}),
		}
	}
}
