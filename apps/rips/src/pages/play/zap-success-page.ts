import {
	AvailableStakeDto,
	CurrencyAmountDto,
	GetZapResultResponseDtoOutput,
} from '@rips/api-client'
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

export const ZapSuccessPage = {
	render(args: {
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
			`Round: #${zapSuccessResult.roundId.toString()}`,
			`Ticket count: ${ticketCount.toString()}`,
			`Paid: ${formatAmountWithUsd(amountIn)}`,
		]

		if (zapSuccessResult.dstTransaction.cost !== undefined) {
			lines.push(
				`Blockchain fee: ${formatAmountWithUsd(zapSuccessResult.dstTransaction.cost)}`,
			)
		}

		return {
			message: lines.join('\n'),
			keyboard: new InlineKeyboard().text(
				'Home',
				buildActionData(actionIds.openHome, undefined),
			),
		}
	},
}
