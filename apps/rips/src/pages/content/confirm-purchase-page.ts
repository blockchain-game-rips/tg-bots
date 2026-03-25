import { InlineKeyboard } from 'grammy'
import { Stake } from '../../api/schemas'
import { buildCommand } from '../../button-handler/utils'
import { PageContent } from '../../types'
import { formatUnits } from '../../utils/units'
import { pageIds } from '../page-ids'

export class ConfirmPurchasePage {
	static render(stake: Stake, ticketAmount: number): PageContent {
		const priceRaw = BigInt(stake.ticketPrice.amount)
		const { decimals, symbol } = stake.ticketPrice.currency
		const totalCostRaw = priceRaw * BigInt(ticketAmount)

		const price = formatUnits(priceRaw, decimals)
		const totalCost = formatUnits(totalCostRaw, decimals)

		return {
			message: `Stake: ${price} ${symbol}\n\nTicket amount: ${ticketAmount}\n\nTotal cost: ${totalCost} ${symbol}`,
			keyboard: new InlineKeyboard()
				.text(
					'Confirm',
					buildCommand({
						pageId: pageIds.successPurchase,
						type: 'open',
						payloads: [],
					}),
				)
				.row()
				.text(
					'Back',
					buildCommand({
						pageId: pageIds.chooseTicketAmount,
						type: 'open',
						payloads: [stake.id.toString()],
					}),
				)
				.text(
					'Home',
					buildCommand({
						pageId: pageIds.home,
						type: 'open',
						payloads: [],
					}),
				),
		}
	}
}
