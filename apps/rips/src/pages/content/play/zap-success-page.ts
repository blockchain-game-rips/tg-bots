import { InlineKeyboard } from 'grammy'
import {
	AvailableStakeDto,
	CurrencyAmountDto,
	GetZapResultResponseDtoOutput,
} from '../../../../generated/api-client'
import { actionIds } from '../../../actions'
import { PageContent } from '../../../types'
import { formattedAmountWithUsd } from '../../../utils/units'
import { configName, getConfig, messageFromLines } from '../../utils'

export class ZapSuccessPage {
	static render(args: {
		availableStake: AvailableStakeDto
		ticketCount: number
		amountIn: CurrencyAmountDto
		zapSuccessResult: NonNullable<GetZapResultResponseDtoOutput['success']>
	}): PageContent {
		const { availableStake, ticketCount, amountIn, zapSuccessResult } = args

		const config = getConfig(availableStake)

		const lines = [
			`✅ Zap successful!`,
			'',
			`${configName(config)} stake`,
			`Round: #${zapSuccessResult.roundId}`,
			`Ticket count: ${ticketCount}`,
			`Paid: ${formattedAmountWithUsd(amountIn)}`,
		]

		if (zapSuccessResult.dstTransaction.cost !== undefined) {
			lines.push(
				`Blockchain fee: ${formattedAmountWithUsd(zapSuccessResult.dstTransaction.cost)}`,
			)
		}

		return {
			message: messageFromLines(lines),
			keyboard: new InlineKeyboard().text('Home', actionIds.showHome),
		}
	}
}
