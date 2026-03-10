import { InlineKeyboard } from 'grammy'
import { buildCommand } from '../../commands'
import { getStakesMock } from '../../services/stake.service'
import { chooseTicketAmountPageId } from '../choose-ticket-amount/choose-ticket-amount-page'
import { NavIds, Page, PageContent, WithNav } from '../interfaces'
import { addNav } from '../utils.ts/utils'

export class ChooseStakePage implements Page, WithNav {
	constructor(readonly navIds: NavIds) {}

	async render(): Promise<PageContent> {
		const stakes = await getStakesMock()

		const keyboard = new InlineKeyboard()

		for (const stake of stakes) {
			keyboard.text(
				stake.ticketPrice.toString(),
				buildCommand({
					type: 'open',
					pageId: chooseTicketAmountPageId,
					payloads: [stake.stakeId.toString()],
				}),
			)
		}

		return {
			message: 'Choose stake',
			keyboard: addNav(keyboard, this.navIds),
		}
	}
}
