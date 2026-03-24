import { InlineKeyboard } from 'grammy'
import { Balance, Stake } from '../../api/schemas'
import { buildCommand } from '../../commands'
import { PageContent } from '../../types'
import { formatUnits } from '../../utils/units'
import { pageIds } from '../page-ids'

export class InsufficientFundsPage {
	static render(
		stake: Stake,
		ticketAmount: number,
		balance: Balance,
	): PageContent {
		const priceRaw = BigInt(stake.ticketPrice.amount)
		const { decimals, symbol } = stake.ticketPrice.currency
		const totalCostRaw = priceRaw * BigInt(ticketAmount)

		const price = formatUnits(priceRaw, decimals)
		const totalCost = formatUnits(totalCostRaw, decimals)
		const balanceFormatted = formatUnits(
			BigInt(balance.amount),
			balance.currency.decimals,
		)

		const message =
			`Stake: ${price} ${symbol}\n\n` +
			`Ticket amount: ${ticketAmount}\n\n` +
			`Total cost: ${totalCost} ${symbol}\n\n` +
			`⚠️ Insufficient Balance: ${balanceFormatted} ${balance.currency.symbol}`

		return {
			message,
			keyboard: new InlineKeyboard()
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
					buildCommand({ pageId: pageIds.home, type: 'open' }),
				),
		}
	}
}
