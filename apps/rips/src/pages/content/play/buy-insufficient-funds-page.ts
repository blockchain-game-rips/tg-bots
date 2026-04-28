import { InlineKeyboard } from 'grammy'
import {
	AvailableStakeDto,
	CurrencyAmountDto,
} from '../../../../generated/api-client'
import { actionIds } from '../../../actions'
import { PageContent } from '../../../types'
import { formatUnits, toUsd } from '../../../utils/units'
import {
	buildActionData,
	configName,
	messageFromLines,
	resolveConfig,
} from '../../utils'

export class BuyInsufficientFundsPage {
	static render(
		balance: CurrencyAmountDto,
		availableStake: AvailableStakeDto,
		ticketCount: number,
	): PageContent {
		const config = resolveConfig(availableStake)

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

		return {
			message: messageFromLines(lines),
			keyboard: new InlineKeyboard()
				.text('Enter from another token', actionIds.showZapChooseChain)
				.row()
				.text(
					'Back',
					buildActionData(
						actionIds.showChooseTicketAmount,
						availableStake.stake.id.toString(),
					),
				)
				.text('Home', actionIds.showHome),
		}
	}
}
