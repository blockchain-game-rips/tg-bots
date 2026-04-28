import { InlineKeyboard } from 'grammy'
import {
	AvailableStakeDto,
	CurrencyAmountDto,
	QuoteZapResponseDtoOutput,
} from '../../../../generated/api-client'
import { actionIds } from '../../../actions'
import { PageContent } from '../../../types'
import { formattedAmountWithUsd } from '../../../utils/units'
import {
	addNav,
	configName,
	messageFromLines,
	resolveConfig,
} from '../../utils'

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

		const config = resolveConfig(availableStake)

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
			actionIds.showZapConfirm,
		)

		addNav(keyboard, {
			parent: actionIds.showZapChooseToken,
			home: actionIds.showHome,
		})

		return { message: messageFromLines(lines), keyboard }
	}
}
