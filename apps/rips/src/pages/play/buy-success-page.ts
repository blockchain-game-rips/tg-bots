import { InlineKeyboard } from 'grammy'
import {
	BuyTicketsPurchaseResponseDtoOutput,
	RoundDto,
} from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { formatAmountWithUsd } from '../../utils/currency'
import { messageFromLines } from '../../utils/message'
import { configName } from '../../utils/stake'

export class BuySuccessPage {
	static render(
		purchase: BuyTicketsPurchaseResponseDtoOutput,
		round?: RoundDto,
	): PageContent {
		const lines = [`✅ Purchase successful!`, '']

		if (round !== undefined) {
			lines.push(`Stake: ${configName(round.config)}`)
		}

		lines.push(`Round: #${purchase.roundId}`)
		lines.push(`Tickets: ${purchase.ticketCount}`)

		if (round !== undefined) {
			const ticketCost =
				BigInt(purchase.ticketCount) *
				BigInt(round.config.ticketPrice.amount)

			const currency = round.config.ticketPrice.currency

			lines.push(
				`Tickets cost: ${formatAmountWithUsd({ amount: ticketCost.toString(), currency })}`,
			)
		}

		const cost = purchase.transaction.cost
		if (cost !== undefined) {
			lines.push(`Blockchain fee: ${formatAmountWithUsd(cost)}`)
		}

		return {
			message: messageFromLines(lines),
			keyboard: new InlineKeyboard().text('Home', actionIds.showHome),
		}
	}
}
