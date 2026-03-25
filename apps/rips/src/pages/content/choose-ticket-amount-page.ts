import { InlineKeyboard } from 'grammy'
import { Stake } from '../../api/schemas'
import { buildCommand } from '../../button-handler/utils'
import { promptIds } from '../../prompts/prompt-ids'
import { PageContent } from '../../types'
import { formatUnits, formatUsd } from '../../utils/units'
import { pageIds } from '../page-ids'
import { addNav, readableStake } from '../utils'

export class ChooseTicketAmountPage {
	static render(stake: Stake, ethPrice: number): PageContent {
		const { decimals } = stake.ticketPrice.currency
		const ticketPrice = formatUnits(
			BigInt(stake.ticketPrice.amount),
			decimals,
		)
		const keyboard = new InlineKeyboard()
			.text(
				'1 Ticket',
				buildCommand({
					type: 'open',
					pageId: pageIds.confirmPurchase,
					payloads: ['1'],
				}),
			)
			.row()
			.text(
				'3 Tickets',
				buildCommand({
					type: 'open',
					pageId: pageIds.confirmPurchase,
					payloads: ['3'],
				}),
			)
			.row()
			.text(
				'Custom Amount',
				buildCommand({
					promptId: promptIds.customTicketAmount,
					type: 'reply',
				}),
			)

		return {
			message: `Choose how many tickets to buy at ${readableStake(stake)} ${formatUsd(ticketPrice, ethPrice)} each.`,
			keyboard: addNav(keyboard, {
				home: pageIds.home,
				parent: pageIds.chooseStake,
			}),
		}
	}
}
