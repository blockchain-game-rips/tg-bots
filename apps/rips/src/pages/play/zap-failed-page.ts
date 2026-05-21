import { AvailableStakeDto, CurrencyAmountDto } from '@rips/api-client'
import { buildActionData } from '@rips/grammy-kit'
import {
	buyTicketsBreadcrumb,
	configName,
	formatAmountWithUsd,
	resolveConfig,
} from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { chainToName } from '../../utils/chain'

export const ZapFailedPage = {
	render(args: {
		availableStake: AvailableStakeDto
		ticketCount: number
		amountIn: CurrencyAmountDto
		refund: CurrencyAmountDto
	}): PageContent {
		const { availableStake, ticketCount, amountIn, refund } = args

		const config = resolveConfig(availableStake)
		const { currency } = amountIn
		const chain = currency.chainAddress.chain

		const lines = [
			buyTicketsBreadcrumb(
				configName(config),
				chainToName(chain),
				currency.symbol,
			),
			'',
			'❌ Zap failed',
			'',
			`Ticket count: ${ticketCount.toString()}`,
			`Paid: ${formatAmountWithUsd(amountIn)}`,
			`Refund: ${formatAmountWithUsd(refund)}`,
		]

		return {
			message: lines.join('\n'),
			keyboard: new InlineKeyboard().text(
				'Home',
				buildActionData(actionIds.openHome, undefined),
			),
		}
	},
}
