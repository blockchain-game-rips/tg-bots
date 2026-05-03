import { InlineKeyboard } from 'grammy'
import {
	BuyTicketsPurchaseResponseDtoOutput,
	RoundDto,
} from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { buyTicketsBreadcrumb } from '../../utils/breadcrumb'
import { formatAmountWithUsd } from '../../utils/currency'
import { configName } from '../../utils/stake'

export class BuySuccessPage {
	static render(
		purchase: BuyTicketsPurchaseResponseDtoOutput,
		round?: RoundDto,
	): PageContent {
		const lines = [
			buyTicketsBreadcrumb(
				round !== undefined ? configName(round.config) : undefined,
			),
			'',
			'✅ Purchase successful!',
			'',
			`Round: #${purchase.roundId}`,
			`Tickets: ${purchase.ticketCount}`,
		]

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
			lines.push('')
			lines.push(`Blockchain fee: ${formatAmountWithUsd(cost)}`)
		}

		lines.push('')
		lines.push(`Transaction: <code>${purchase.transaction.id}</code>`)

		return {
			message: lines.join('\n'),
			keyboard: new InlineKeyboard().text('Home', actionIds.openHome),
		}
	}
}
