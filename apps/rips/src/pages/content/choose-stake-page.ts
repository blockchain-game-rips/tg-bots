import { InlineKeyboard } from 'grammy'
import { Stake } from '../../api/schemas'
import { buildCommand } from '../../commands'
import { PageContent } from '../../types'
import { pageIds } from '../page-ids'
import { addNav, readableStake } from '../utils'

export class ChooseStakePage {
	static render(stakes: Stake[]): PageContent {
		const keyboard = new InlineKeyboard()

		for (const stake of stakes) {
			keyboard.text(
				readableStake(stake),
				buildCommand({
					type: 'open',
					pageId: pageIds.chooseTicketAmount,
					payloads: [stake.id.toString()],
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
