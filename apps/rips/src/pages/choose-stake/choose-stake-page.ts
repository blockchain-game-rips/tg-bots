import { InlineKeyboard } from 'grammy'
import { buildCommand } from '../../commands'
import { PageContent } from '../interfaces'
import { pageIds } from '../page-ids'
import { addNav } from '../utils.ts/utils'

type Stake = { stakeId: number; ticketPrice: number }

export class ChooseStakePage {
	static render(stakes: Stake[]): PageContent {
		const keyboard = new InlineKeyboard()

		for (const stake of stakes) {
			keyboard.text(
				stake.ticketPrice.toString(),
				buildCommand({
					type: 'open',
					pageId: pageIds.chooseTicketAmount,
					payloads: [stake.stakeId.toString()],
				}),
			)
		}

		return {
			message: 'Choose stake',
			keyboard: addNav(keyboard, {
				home: pageIds.home,
				parent: pageIds.play,
			}),
		}
	}
}
