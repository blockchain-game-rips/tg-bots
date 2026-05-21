import { AvailableStakeDto } from '@rips/api-client'
import { addNav, buildActionData } from '@rips/grammy-kit'
import { configName, resolveConfig } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'

export const CardCollectionChooseStakePage = {
	render(availableStakes: AvailableStakeDto[]): PageContent {
		const keyboard = new InlineKeyboard()

		for (const availableStake of availableStakes) {
			const config = resolveConfig(availableStake)

			keyboard
				.text(
					configName(config),
					buildActionData(
						actionIds.openCardCollection,
						availableStake.stake.id,
					),
				)
				.row()
		}

		return {
			message: 'Choose a stake to view your card collection:',
			keyboard: addNav(keyboard, {
				home: actionIds.openHome,
				parent: actionIds.openPlay,
			}),
		}
	},
}
