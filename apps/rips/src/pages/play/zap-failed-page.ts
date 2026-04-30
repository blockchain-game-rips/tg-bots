import { InlineKeyboard } from 'grammy'
import {
	AvailableStakeDto,
	CurrencyAmountDto,
} from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { chainToName } from '../../utils/chain'
import { formatAmountWithUsd } from '../../utils/currency'
import { configName, resolveConfig } from '../../utils/stake'

export class ZapFailedPage {
	static render(args: {
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
			`<b>🎮 Buy Tickets › ${configName(config)} › ${chainToName(chain)} › ${currency.symbol}</b>`,
			'',
			'❌ Zap failed',
			'',
			`Ticket count: ${ticketCount}`,
			`Paid: ${formatAmountWithUsd(amountIn)}`,
			`Refund: ${formatAmountWithUsd(refund)}`,
		]

		return {
			message: lines.join('\n'),
			keyboard: new InlineKeyboard().text('Home', actionIds.showHome),
		}
	}
}
