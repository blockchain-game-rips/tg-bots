import { InlineKeyboard } from 'grammy'
import { Balance, Stake } from '../../api/schemas'
import { buildCommand } from '../../button-handler/utils'
import { PageContent } from '../../types'
import { formatUnits, formatUsd } from '../../utils/units'
import { pageIds } from '../page-ids'

export class InsufficientFundsPage {
	static render(
		stake: Stake,
		ticketAmount: number,
		balance: Balance,
		ethPrice: number,
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
			`You're trying to buy ${ticketAmount} ticket${ticketAmount > 1 ? 's' : ''} at ${price} ${symbol} ${formatUsd(price, ethPrice)} each.\n` +
			`Total: ${totalCost} ${symbol} ${formatUsd(totalCost, ethPrice)}\n\n` +
			`⚠️ Not enough funds. Your balance: ${balanceFormatted} ${balance.currency.symbol} ${formatUsd(balanceFormatted, ethPrice)}`

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
					buildCommand({
						pageId: pageIds.home,
						type: 'open',
						payloads: [],
					}),
				),
		}
	}
}
