import { InlineKeyboard } from 'grammy'
import {
	AvailableStakeDto,
	CurrencyAmountDto,
	GetZapResultResponseDtoOutput,
} from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { buyTicketsBreadcrumb } from '../../utils/breadcrumb'
import { chainToName } from '../../utils/chain'
import { formatAmountWithUsd } from '../../utils/currency'
import { configName, resolveConfig } from '../../utils/stake'

export class ZapSuccessPage {
	static render(args: {
		availableStake: AvailableStakeDto
		ticketCount: number
		amountIn: CurrencyAmountDto
		zapSuccessResult: NonNullable<GetZapResultResponseDtoOutput['success']>
	}): PageContent {
		const { availableStake, ticketCount, amountIn, zapSuccessResult } = args

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
			'✅ Zap successful!',
			'',
			`Round: #${zapSuccessResult.roundId}`,
			`Ticket count: ${ticketCount}`,
			`Paid: ${formatAmountWithUsd(amountIn)}`,
		]

		if (zapSuccessResult.dstTransaction.cost !== undefined) {
			lines.push(
				`Blockchain fee: ${formatAmountWithUsd(zapSuccessResult.dstTransaction.cost)}`,
			)
		}

		return {
			message: lines.join('\n'),
			keyboard: new InlineKeyboard().text('Home', actionIds.showHome),
		}
	}
}
