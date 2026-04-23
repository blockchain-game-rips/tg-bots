import { InlineKeyboard } from 'grammy'
import {
	AvailableStakeDto,
	CurrencyAmountDto,
	QuoteZapResponseDtoOutput,
} from '../../../../generated/api-client'
import { buildCommand } from '../../../button-handler/utils'
import { PageContent } from '../../../types'
import { formattedAmountWithUsd } from '../../../utils/units'
import { pageIds } from '../../page-ids'
import { addNav, configName, getConfig } from '../../utils'

export class ZapConfirmPage {
	static render(args: {
		availableStake: AvailableStakeDto
		ticketCount: number
		nativeBalance: CurrencyAmountDto
		currencyInBalance: CurrencyAmountDto
		zapQuote: QuoteZapResponseDtoOutput
	}): PageContent {
		const {
			availableStake,
			ticketCount,
			nativeBalance,
			currencyInBalance,
			zapQuote,
		} = args

		const config = getConfig(availableStake)

		const lines = [
			`${configName(config)} stake`,
			`Ticket count: ${ticketCount}`,
			'',
			`Pay: ${formattedAmountWithUsd(zapQuote.amountIn)}`,
			`Your balance: ${formattedAmountWithUsd(currencyInBalance)}`,
			'',
			`Network fee: ${formattedAmountWithUsd(zapQuote.fee)}`,
			`Native balance: ${formattedAmountWithUsd(nativeBalance)}`,
			'',
			'Confirm to proceed with zap',
		]

		const keyboard = new InlineKeyboard().text(
			'Confirm',
			buildCommand({
				pageId: pageIds.zapSuccess,
				type: 'open',
				payloads: [],
			}),
		)

		addNav(keyboard, { parent: pageIds.zapChooseToken, home: pageIds.home })

		return { message: lines.join('\n'), keyboard }
	}
}
