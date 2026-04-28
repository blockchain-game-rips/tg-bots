import { InlineKeyboard } from 'grammy'
import {
	AvailableStakeDto,
	CurrencyAmountDto,
	QuoteZapResponseDtoOutput,
} from '../../../../generated/api-client'
import { actionIds } from '../../../actions'
import { PageContent } from '../../../types'
import { formattedAmountWithUsd } from '../../../utils/units'
import { addNav, configName, getConfig, messageFromLines } from '../../utils'

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
			actionIds.executeZap,
		)

		addNav(keyboard, {
			parent: actionIds.showZapChooseToken,
			home: actionIds.showHome,
		})

		return { message: messageFromLines(lines), keyboard }
	}
}
