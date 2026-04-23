import { InlineKeyboard } from 'grammy'
import {
	AvailableStakeDto,
	CurrencyAmountDto,
	GetZapResultResponseDtoOutput,
} from '../../../../generated/api-client'
import { buildCommand } from '../../../button-handler/utils'
import { PageContent } from '../../../types'
import { formattedAmountWithUsd } from '../../../utils/units'
import { pageIds } from '../../page-ids'
import { configName, getConfig } from '../../utils'

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
