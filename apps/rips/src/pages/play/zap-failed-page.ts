import { InlineKeyboard } from 'grammy'
import {
	AvailableStakeDto,
	CurrencyAmountDto,
} from '../../../generated/api-client'
import { buildActionData } from '../../grammy-kit/action/action-data'
import { actionIds } from '../../grammy-kit/action/actions'
import { PageContent } from '../../types'
import { buyTicketsBreadcrumb } from '../../utils/breadcrumb'
import { chainToName } from '../../utils/chain'
import { formatAmountWithUsd } from '../../utils/currency'
import { configName, resolveConfig } from '../../utils/stake'

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
