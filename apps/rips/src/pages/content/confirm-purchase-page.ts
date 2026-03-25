import { InlineKeyboard } from 'grammy'
import { Stake } from '../../api/schemas'
import { buildCommand } from '../../button-handler/utils'
import { PageContent } from '../../types'
import { formatUnits, formatUsd } from '../../utils/units'
import { pageIds } from '../page-ids'

export class ConfirmPurchasePage {
	static render(
		stake: Stake,
		ticketAmount: number,
		ethPrice: number,
	): PageContent {
		const priceRaw = BigInt(stake.ticketPrice.amount)
		const { decimals, symbol } = stake.ticketPrice.currency
		const totalCostRaw = priceRaw * BigInt(ticketAmount)

		const price = formatUnits(priceRaw, decimals)
		const totalCost = formatUnits(totalCostRaw, decimals)

		return {
			message: `You're about to buy ${ticketAmount} ticket${ticketAmount > 1 ? 's' : ''} at ${price} ${symbol} ${formatUsd(price, ethPrice)} each.\nTotal: ${totalCost} ${symbol} ${formatUsd(totalCost, ethPrice)}\n\nConfirm to proceed.`,
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
