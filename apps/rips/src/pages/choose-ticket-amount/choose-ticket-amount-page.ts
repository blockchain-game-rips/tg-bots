import { InlineKeyboard } from 'grammy'
import { buildCommand } from '../../commands'
import { promptIds } from '../../prompts/prompt-ids'
import { getStakesMock } from '../../services/stake.service'
import { PageContent } from '../interfaces'
import { pageIds } from '../page-ids'
import { addNav } from '../utils.ts/utils'

export class ChooseTicketAmountPage {
	async render(stakeId: string): Promise<PageContent> {
		const stakes = await getStakesMock()

		const stake = stakes.find(
			(stake) => stake.stakeId.toString() === stakeId,
		)

		if (stake === undefined) {
			throw new Error(`stakeId ${stakeId} is invalid`)
		}

		const keyboard = new InlineKeyboard()
			.text('1 Ticket')
			.text('3 Tickets')
			.text(
				'Custom amount',
				buildCommand({
					promptId: promptIds.customTicketAmount,
					type: 'reply',
				}),
			)

		return {
			message: `Choose tickets amount for stake ${stake.ticketPrice} ETH`,
			keyboard: addNav(keyboard, {
				home: pageIds.home,
				parent: pageIds.chooseStake,
			}),
		}
	}
}
