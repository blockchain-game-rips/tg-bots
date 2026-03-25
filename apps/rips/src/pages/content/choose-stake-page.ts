import { InlineKeyboard } from 'grammy'
import { Stake } from '../../api/schemas'
import { buildCommand } from '../../button-handler/utils'
import { PageContent } from '../../types'
import { formatUnits, formatUsd } from '../../utils/units'
import { pageIds } from '../page-ids'
import { addNav, readableStake } from '../utils'

export class ChooseStakePage {
	static render(stakes: Stake[], ethPrice: number): PageContent {
		const keyboard = new InlineKeyboard()

		for (const stake of stakes) {
			const { decimals } = stake.ticketPrice.currency
			const ticketPrice = formatUnits(
				BigInt(stake.ticketPrice.amount),
				decimals,
			)

			keyboard
				.text(
					`${readableStake(stake)} ${formatUsd(ticketPrice, ethPrice)}`,
					buildCommand({
						type: 'open',
						pageId: pageIds.chooseTicketAmount,
						payloads: [stake.id.toString()],
					}),
				)
				.row()
		}

		return {
			message:
				'Choose your stake — the higher the ticket price, the bigger the potential reward.',
			keyboard: addNav(keyboard, {
				home: pageIds.home,
				parent: pageIds.play,
			}),
		}
	}
}
