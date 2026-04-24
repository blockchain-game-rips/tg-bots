import { InlineKeyboard } from 'grammy'
import { AvailableStakeDto } from '../../../../generated/api-client'
import { buildCommand } from '../../../button-handler/utils'
import { PageContent } from '../../../types'
import { pageIds } from '../../page-ids'
import { addNav, configName, getConfig } from '../../utils'

export class CardCollectionChooseStakePage {
	static render(availableStakes: AvailableStakeDto[]): PageContent {
		const keyboard = new InlineKeyboard()

		for (const availableStake of availableStakes) {
			const config = getConfig(availableStake)

			keyboard
				.text(
					configName(config),
					buildCommand({
						type: 'open',
						pageId: pageIds.cardCollection,
						payloads: [availableStake.stake.id.toString()],
					}),
				)
				.row()
		}

		return {
			message: 'Choose a stake to view your card collection:',
			keyboard: addNav(keyboard, {
				home: pageIds.home,
				parent: pageIds.play,
			}),
		}
	}
}
