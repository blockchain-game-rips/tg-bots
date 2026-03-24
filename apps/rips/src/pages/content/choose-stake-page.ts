import { InlineKeyboard } from 'grammy'
import { Stake } from '../../api/schemas'
import { buildCommand } from '../../commands'
import { PageContent } from '../../types'
import { formatUnits } from '../../utils/units'
import { pageIds } from '../page-ids'
import { addNav } from '../utils'

export class ChooseStakePage {
	static render(stakes: Stake[]): PageContent {
		const keyboard = new InlineKeyboard()

		for (const stake of stakes) {
			const price = formatUnits(
				BigInt(stake.ticketPrice.amount),
				stake.ticketPrice.currency.decimals,
			)

			keyboard.text(
				`${price} ${stake.ticketPrice.currency.symbol}`,
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
