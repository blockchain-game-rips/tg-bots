import { InlineKeyboard } from 'grammy'
import {
	BuyTicketsPurchaseResponseDtoOutput,
	RoundDto,
} from '../../../../generated/api-client'
import { buildCommand } from '../../../button-handler/utils'
import { PageContent } from '../../../types'
import { formatUnits, toUsd } from '../../../utils/units'
import { pageIds } from '../../page-ids'
import { configName } from '../../utils'

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

			const ticketCostFormatted = formatUnits(
				ticketCost,
				currency.decimals,
			)

			lines.push(
				`Tickets cost: ${ticketCostFormatted} ${currency.symbol} ${toUsd({ amount: ticketCost.toString(), currency: currency })}`,
			)
		}

		const cost = purchase.transaction.cost
		if (cost !== undefined) {
			const costFormatted = formatUnits(
				BigInt(cost.amount),
				cost.currency.decimals,
			)

			lines.push(
				`Blockchain fee: ${costFormatted} ${cost.currency.symbol} ${toUsd(cost)}`,
			)
		}

		return {
			message: lines.join('\n'),
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
