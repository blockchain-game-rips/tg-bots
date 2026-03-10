import { InlineKeyboard } from 'grammy'
import { buildCommand } from '../../commands'
import { getStakesMock } from '../../services/stake.service'
import { Page, PageContent } from '../interfaces'
import { pageIds } from '../page-ids'
import { addNav } from '../utils.ts/utils'

export class ChooseStakePage implements Page {
	async render(): Promise<PageContent> {
		const stakes = await getStakesMock()

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
