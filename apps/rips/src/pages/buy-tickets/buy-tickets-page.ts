import { InlineKeyboard } from 'grammy'
import { buildCommand } from '../../commands'
import { wait } from '../../utils/common'
import { chooseTicketAmountPageId } from '../choose-ticket-amount/choose-ticket-amount-page'
import { NavIds, Page, Renderable, WithNav } from '../interfaces'
import { addNav } from '../utils.ts/utils'

export class BuyTicketsPage implements Renderable, WithNav {
	constructor(readonly navIds: NavIds) {}

	async render(): Promise<Page> {
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

async function getStakesMock() {
	await wait(100)
	return [
		{ stakeId: 1, ticketPrice: 0.0025 },
		{ stakeId: 2, ticketPrice: 0.005 },
		{ stakeId: 3, ticketPrice: 0.01 },
	]
}
