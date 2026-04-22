import { InlineKeyboard } from 'grammy'
import {
	AvailableStakeDto,
	CurrencyAmountDto,
} from '../../../generated/api-client'
import { buildCommand } from '../../button-handler/utils'
import { PageContent } from '../../types'
import { formatUnits, toUsd } from '../../utils/units'
import { pageIds } from '../page-ids'
import { configName, getConfig } from '../utils'

export class InsufficientFundsPage {
	static render(
		balance: CurrencyAmountDto,
		availableStake: AvailableStakeDto,
		ticketCount: number,
	): PageContent {
		const config = getConfig(availableStake)

		const formattedBalance = formatUnits(
			BigInt(balance.amount),
			balance.currency.decimals,
		)

		const lines = [
			`${configName(config)} stake`,
			`Ticket count: ${ticketCount}`,
			'',
			`⚠️ Not enough funds. Your balance: ${formattedBalance} ${toUsd(balance)}`,
		]

		const message = lines.join('\n')

		return {
			message,
			keyboard: new InlineKeyboard()
				.text(
					'Back',
					buildCommand({
						pageId: pageIds.chooseTicketAmount,
						type: 'open',
						payloads: [availableStake.stake.id.toString()],
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
