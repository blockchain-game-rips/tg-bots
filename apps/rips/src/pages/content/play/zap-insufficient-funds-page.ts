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

export class ZapInsufficientFundsPage {
	static render(args: {
		availableStake: AvailableStakeDto
		ticketCount: number
		nativeBalance: CurrencyAmountDto
		currencyInBalance: CurrencyAmountDto
		zapQuote: QuoteZapResponseDtoOutput
		userEvmAddress: string
	}): PageContent {
		const {
			availableStake,
			ticketCount,
			currencyInBalance,
			zapQuote,
			userEvmAddress,
		} = args

		const config = getConfig(availableStake)

		const lines = [
			`${configName(config)} stake`,
			`Ticket count: ${ticketCount}`,
			'',
			`⚠️ Not enough funds.`,
			`Required: ${formattedAmountWithUsd(zapQuote.amountIn)}`,
			`Your balance: ${formattedAmountWithUsd(currencyInBalance)}`,
			'',
			`Address: ${userEvmAddress}`,
		]

		const keyboard = new InlineKeyboard().text(
			'Update balance and continue',
			buildCommand({
				pageId: pageIds.zapConfirm,
				type: 'open',
				payloads: [],
			}),
		)

		addNav(keyboard, { parent: pageIds.zapChooseToken, home: pageIds.home })

		return { message: lines.join('\n'), keyboard }
	}
}
