import { InlineKeyboard } from 'grammy'
import { BuyTickets, Stake } from '../../api/schemas'
import { buildCommand } from '../../commands'
import { PageContent } from '../../types'
import { formatUnits } from '../../utils/units'
import { pageIds } from '../page-ids'

export class SuccessPurchasePage {
	static render(stake: Stake, purchase: BuyTickets): PageContent {
		const { decimals, symbol } = stake.ticketPrice.currency
		const totalCost = formatUnits(BigInt(purchase.cost.amount), decimals)

		const message =
			`✅ Purchase successful!\n\n` +
			`Stake: ${formatUnits(BigInt(stake.ticketPrice.amount), decimals)} ${symbol}\n` +
			`Round: #${purchase.roundId}\n` +
			`Tickets purchased: ${purchase.ticketAmount}\n` +
			`Total cost: ${totalCost} ${symbol}`

		return {
			message,
			keyboard: new InlineKeyboard().text(
				'Home',
				buildCommand({ pageId: pageIds.home, type: 'open' }),
			),
		}
	}
}
