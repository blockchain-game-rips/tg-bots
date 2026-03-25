import { InlineKeyboard } from 'grammy'
import { BuyTickets, Stake } from '../../api/schemas'
import { buildCommand } from '../../button-handler/utils'
import { PageContent } from '../../types'
import { formatUnits } from '../../utils/units'
import { pageIds } from '../page-ids'
import { readableStake } from '../utils'

export class SuccessPurchasePage {
	static render(stake: Stake, purchase: BuyTickets): PageContent {
		const { decimals, symbol } = stake.ticketPrice.currency
		const ticketsCost = formatUnits(
			BigInt(stake.ticketPrice.amount) * BigInt(purchase.ticketAmount),
			decimals,
		)
		const blockchainFee = formatUnits(BigInt(purchase.cost.amount), decimals)

		const message =
			`✅ Purchase successful!\n\n` +
			`Stake: ${readableStake(stake)}\n` +
			`Round: #${purchase.roundId}\n` +
			`Tickets: ${purchase.ticketAmount}\n` +
			`Tickets cost: ${ticketsCost} ${symbol}\n` +
			`Blockchain fee: ${blockchainFee} ${symbol}`

		return {
			message,
			keyboard: new InlineKeyboard().text(
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
